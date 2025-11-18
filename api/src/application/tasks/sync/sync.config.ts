import { Injectable } from '@nestjs/common';
import {
    SyncConfiguration,
    SyncDirection,
    ConflictResolutionPolicy,
    FieldMappingConfig,
    TASK_STATUS_MAPPING,
    AZURE_DEVOPS_STATUS_MAPPING,
    TASK_PRIORITY_MAPPING,
    AZURE_DEVOPS_PRIORITY_MAPPING,
} from './interfaces/sync.interface';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

@Injectable()
export class SyncConfigurationService {
    getDefaultConfiguration(): SyncConfiguration {
        return {
            organization: process.env.AZURE_DEVOPS_ORGANIZATION || '',
            project: process.env.AZURE_DEVOPS_PROJECT || '',
            workItemType: process.env.AZURE_DEVOPS_WORK_ITEM_TYPE || 'Task',
            syncDirection: SyncDirection.BI_DIRECTIONAL,
            fieldMappings: this.getDefaultFieldMappings(),
            conflictResolution: ConflictResolutionPolicy.LATEST_WINS,
            filters: {
                includeWorkItemTypes: ['Task', 'Bug', 'User Story'],
                lastModifiedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
            webhookSecret: process.env.AZURE_DEVOPS_WEBHOOK_SECRET || '',
        };
    }

    private getDefaultFieldMappings(): FieldMappingConfig[] {
        return [
            {
                taskField: 'title',
                azureDevOpsField: 'System.Title',
                direction: SyncDirection.BI_DIRECTIONAL,
                required: true,
            },
            {
                taskField: 'description',
                azureDevOpsField: 'System.Description',
                direction: SyncDirection.BI_DIRECTIONAL,
                transformer: {
                    toAzureDevOps: (value: string) => value || '',
                    fromAzureDevOps: (value: string) => value || undefined,
                },
            },
            {
                taskField: 'status',
                azureDevOpsField: 'System.State',
                direction: SyncDirection.BI_DIRECTIONAL,
                transformer: {
                    toAzureDevOps: (status: TaskStatus) => TASK_STATUS_MAPPING[status] || 'New',
                    fromAzureDevOps: (state: string) => AZURE_DEVOPS_STATUS_MAPPING[state] || TaskStatus.NEW,
                },
                required: true,
            },
            {
                taskField: 'priority',
                azureDevOpsField: 'Microsoft.VSTS.Common.Priority',
                direction: SyncDirection.BI_DIRECTIONAL,
                transformer: {
                    toAzureDevOps: (priority: TaskPriority) => TASK_PRIORITY_MAPPING[priority] || 3,
                    fromAzureDevOps: (priority: number) => AZURE_DEVOPS_PRIORITY_MAPPING[priority] || TaskPriority.MEDIUM,
                },
            },
            {
                taskField: 'assigneeId',
                azureDevOpsField: 'System.AssignedTo',
                direction: SyncDirection.BI_DIRECTIONAL,
                transformer: {
                    toAzureDevOps: (userId: string) => this.mapUserIdToAzureDevOpsUser(userId),
                    fromAzureDevOps: (assignedTo: any) => this.mapAzureDevOpsUserToUserId(assignedTo),
                },
            },
            {
                taskField: 'projectId',
                azureDevOpsField: 'System.AreaPath',
                direction: SyncDirection.ONE_WAY_FROM_AZURE,
                transformer: {
                    fromAzureDevOps: (areaPath: string) => this.extractProjectFromAreaPath(areaPath),
                },
            },
            {
                taskField: 'externalId',
                azureDevOpsField: 'System.Id',
                direction: SyncDirection.ONE_WAY_FROM_AZURE,
                transformer: {
                    fromAzureDevOps: (id: number) => id?.toString(),
                },
            },
            {
                taskField: 'createdAt',
                azureDevOpsField: 'System.CreatedDate',
                direction: SyncDirection.ONE_WAY_FROM_AZURE,
                transformer: {
                    fromAzureDevOps: (dateString: string) => new Date(dateString),
                },
            },
            {
                taskField: 'updatedAt',
                azureDevOpsField: 'System.ChangedDate',
                direction: SyncDirection.ONE_WAY_FROM_AZURE,
                transformer: {
                    fromAzureDevOps: (dateString: string) => new Date(dateString),
                },
            },
            {
                taskField: 'metadata',
                azureDevOpsField: 'System.Tags',
                direction: SyncDirection.BI_DIRECTIONAL,
                transformer: {
                    toAzureDevOps: (metadata: Record<string, any>) => this.metadataToTags(metadata),
                    fromAzureDevOps: (tags: string) => this.tagsToMetadata(tags),
                },
            },
        ];
    }

    getFieldMapping(taskField: string): FieldMappingConfig | undefined {
        const mappings = this.getDefaultFieldMappings();
        return mappings.find(mapping => mapping.taskField === taskField);
    }

    getAzureDevOpsFieldMapping(azureField: string): FieldMappingConfig | undefined {
        const mappings = this.getDefaultFieldMappings();
        return mappings.find(mapping => mapping.azureDevOpsField === azureField);
    }

    private mapUserIdToAzureDevOpsUser(userId: string): any {
        if (!userId) return undefined;
        // This would typically involve mapping internal user IDs to Azure DevOps user identifiers
        // For now, returning a structure that Azure DevOps expects
        return {
            uniqueName: `${userId}@yourdomain.com`,
            displayName: userId,
        };
    }

    private mapAzureDevOpsUserToUserId(assignedTo: any): string | undefined {
        if (!assignedTo) return undefined;
        if (typeof assignedTo === 'string') return assignedTo;
        // Extract user ID from Azure DevOps user object
        return assignedTo.uniqueName?.split('@')[0] || assignedTo.displayName || assignedTo.id;
    }

    private extractProjectFromAreaPath(areaPath: string): string | undefined {
        if (!areaPath) return undefined;
        // Azure DevOps area paths are typically in format: "ProjectName\\AreaName"
        const parts = areaPath.split('\\');
        return parts[0] || undefined;
    }

    private metadataToTags(metadata: Record<string, any>): string {
        if (!metadata || Object.keys(metadata).length === 0) return '';
        
        const tags = Object.entries(metadata)
            .filter(([key, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${key}:${value}`)
            .join('; ');
        
        return tags;
    }

    private tagsToMetadata(tags: string): Record<string, any> {
        if (!tags) return {};
        
        const metadata: Record<string, any> = {};
        const tagArray = tags.split(';').map(tag => tag.trim());
        
        for (const tag of tagArray) {
            if (tag.includes(':')) {
                const [key, ...valueParts] = tag.split(':');
                const value = valueParts.join(':').trim();
                metadata[key.trim()] = value;
            } else if (tag) {
                metadata[tag] = true;
            }
        }
        
        return metadata;
    }

    validateConfiguration(config: SyncConfiguration): string[] {
        const errors: string[] = [];

        if (!config.organization) {
            errors.push('Azure DevOps organization is required');
        }

        if (!config.project) {
            errors.push('Azure DevOps project is required');
        }

        if (!config.workItemType) {
            errors.push('Work item type is required');
        }

        if (!config.webhookSecret && config.syncDirection !== SyncDirection.ONE_WAY_TO_AZURE) {
            errors.push('Webhook secret is required for bi-directional or from Azure sync');
        }

        // Validate field mappings
        const requiredMappings = config.fieldMappings.filter(mapping => mapping.required);
        for (const mapping of requiredMappings) {
            if (!mapping.taskField || !mapping.azureDevOpsField) {
                errors.push(`Required field mapping is incomplete: ${mapping.taskField} -> ${mapping.azureDevOpsField}`);
            }
        }

        // Check for duplicate field mappings
        const taskFields = config.fieldMappings.map(m => m.taskField);
        const duplicateTaskFields = taskFields.filter((field, index) => taskFields.indexOf(field) !== index);
        if (duplicateTaskFields.length > 0) {
            errors.push(`Duplicate task field mappings: ${duplicateTaskFields.join(', ')}`);
        }

        return errors;
    }

    mergeWithDefaults(partialConfig: Partial<SyncConfiguration>): SyncConfiguration {
        const defaultConfig = this.getDefaultConfiguration();
        
        return {
            ...defaultConfig,
            ...partialConfig,
            fieldMappings: partialConfig.fieldMappings || defaultConfig.fieldMappings,
            filters: {
                ...defaultConfig.filters,
                ...partialConfig.filters,
            },
        };
    }
}