import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';
import { AzureDevOpsApiClient } from '../../../infrastructure/azure-devops/api/client.service';
import { SyncConfigurationService } from './sync.config';
import { SyncConflictResolver } from './sync-conflict.resolver';
import { SyncQueueService } from './sync-queue.service';
import {
    SyncResult,
    SyncOperation,
    SyncStatus,
    SyncDirection,
    FieldMappingConfig,
    WebhookPayload,
} from './interfaces/sync.interface';
import {
    ConflictResolutionContext,
    ConflictResolutionResult,
} from './interfaces/conflict.interface';
import { AzureDevOpsWorkItem, CreateWorkItemRequest } from '../../../infrastructure/azure-devops/api/interfaces/work-item.interface';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);
    private currentSyncStatus: SyncStatus = {
        isRunning: false,
        lastSync: null,
        nextSync: null,
        currentOperation: null,
    };

    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        private readonly azureDevOpsClient: AzureDevOpsApiClient,
        private readonly configService: SyncConfigurationService,
        private readonly conflictResolver: SyncConflictResolver,
        private readonly queueService: SyncQueueService,
    ) {}

    async syncFromAzureDevOps(tenantId: string, userId?: string): Promise<SyncResult> {
        const startTime = new Date();
        const result: SyncResult = {
            success: false,
            operation: SyncOperation.FULL_SYNC,
            itemsProcessed: 0,
            itemsCreated: 0,
            itemsUpdated: 0,
            itemsSkipped: 0,
            conflicts: [],
            errors: [],
            startTime,
            endTime: new Date(),
            duration: 0,
        };

        try {
            this.currentSyncStatus.isRunning = true;
            this.currentSyncStatus.currentOperation = SyncOperation.FULL_SYNC;

            const config = this.configService.getDefaultConfiguration();
            
            if (!config.organization || !config.project) {
                throw new Error('Azure DevOps organization and project must be configured');
            }

            // Query work items from Azure DevOps
            const wiql = this.buildWorkItemQuery(config);
            const queryResult = await this.azureDevOpsClient.queryWorkItems(
                config.organization,
                config.project,
                wiql,
                false,
                1000
            );

            if (!queryResult.workItems?.length) {
                this.logger.debug('No work items found in Azure DevOps');
                result.success = true;
                return result;
            }

            // Get work item details in batches
            const workItemIds = queryResult.workItems.map(wi => wi.id);
            const workItems = await this.azureDevOpsClient.getWorkItems(
                config.organization,
                config.project,
                workItemIds,
                undefined,
                'Fields'
            );

            result.itemsProcessed = workItems.length;

            // Process each work item
            for (const workItem of workItems) {
                try {
                    await this.processWorkItemFromAzure(workItem, tenantId, config, result);
                } catch (error) {
                    this.logger.error(`Error processing work item ${workItem.id}:`, error);
                    result.errors.push({
                        id: `error_${Date.now()}`,
                        operation: 'processWorkItemFromAzure',
                        azureDevOpsId: workItem.id,
                        error: error.message || 'Unknown error',
                        stack: error.stack,
                        retryCount: 0,
                        maxRetries: 3,
                        resolved: false,
                        createdAt: new Date(),
                    });
                }
            }

            result.success = result.errors.length === 0;
            this.logger.debug(`Sync from Azure DevOps completed: ${result.itemsCreated} created, ${result.itemsUpdated} updated, ${result.conflicts.length} conflicts`);

        } catch (error) {
            this.logger.error('Error syncing from Azure DevOps:', error);
            result.errors.push({
                id: `error_${Date.now()}`,
                operation: 'syncFromAzureDevOps',
                error: error.message || 'Unknown error',
                stack: error.stack,
                retryCount: 0,
                maxRetries: 3,
                resolved: false,
                createdAt: new Date(),
            });
        } finally {
            const endTime = new Date();
            result.endTime = endTime;
            result.duration = endTime.getTime() - startTime.getTime();
            
            this.currentSyncStatus.isRunning = false;
            this.currentSyncStatus.lastSync = endTime;
            this.currentSyncStatus.currentOperation = null;
        }

        return result;
    }

    async syncToAzureDevOps(tenantId: string, userId?: string): Promise<SyncResult> {
        const startTime = new Date();
        const result: SyncResult = {
            success: false,
            operation: SyncOperation.FULL_SYNC,
            itemsProcessed: 0,
            itemsCreated: 0,
            itemsUpdated: 0,
            itemsSkipped: 0,
            conflicts: [],
            errors: [],
            startTime,
            endTime: new Date(),
            duration: 0,
        };

        try {
            this.currentSyncStatus.isRunning = true;
            this.currentSyncStatus.currentOperation = SyncOperation.FULL_SYNC;

            const config = this.configService.getDefaultConfiguration();
            
            // Get tasks that need to be synced to Azure DevOps
            const tasks = await this.taskRepository.find({
                where: { tenantId },
                relations: ['assignee'],
            });

            result.itemsProcessed = tasks.length;

            for (const task of tasks) {
                try {
                    await this.processTaskToAzure(task, config, result);
                } catch (error) {
                    this.logger.error(`Error processing task ${task.id}:`, error);
                    result.errors.push({
                        id: `error_${Date.now()}`,
                        operation: 'processTaskToAzure',
                        taskId: task.id,
                        error: error.message || 'Unknown error',
                        stack: error.stack,
                        retryCount: 0,
                        maxRetries: 3,
                        resolved: false,
                        createdAt: new Date(),
                    });
                }
            }

            result.success = result.errors.length === 0;
            this.logger.debug(`Sync to Azure DevOps completed: ${result.itemsCreated} created, ${result.itemsUpdated} updated`);

        } catch (error) {
            this.logger.error('Error syncing to Azure DevOps:', error);
            result.errors.push({
                id: `error_${Date.now()}`,
                operation: 'syncToAzureDevOps',
                error: error.message || 'Unknown error',
                stack: error.stack,
                retryCount: 0,
                maxRetries: 3,
                resolved: false,
                createdAt: new Date(),
            });
        } finally {
            const endTime = new Date();
            result.endTime = endTime;
            result.duration = endTime.getTime() - startTime.getTime();
            
            this.currentSyncStatus.isRunning = false;
            this.currentSyncStatus.lastSync = endTime;
            this.currentSyncStatus.currentOperation = null;
        }

        return result;
    }

    async processWebhookPayload(payload: WebhookPayload, tenantId: string): Promise<SyncResult> {
        const startTime = new Date();
        const result: SyncResult = {
            success: false,
            operation: SyncOperation.WEBHOOK_SYNC,
            itemsProcessed: 1,
            itemsCreated: 0,
            itemsUpdated: 0,
            itemsSkipped: 0,
            conflicts: [],
            errors: [],
            startTime,
            endTime: new Date(),
            duration: 0,
        };

        try {
            this.logger.debug(`Processing webhook for work item ${payload.resource.id}`);

            const config = this.configService.getDefaultConfiguration();
            
            // Get the work item from Azure DevOps
            const workItem = await this.azureDevOpsClient.getWorkItem(
                config.organization,
                config.project,
                payload.resource.id,
                undefined,
                'Fields'
            );

            await this.processWorkItemFromAzure(workItem, tenantId, config, result);
            result.success = true;

        } catch (error) {
            this.logger.error(`Error processing webhook for work item ${payload.resource.id}:`, error);
            result.errors.push({
                id: `webhook_error_${Date.now()}`,
                operation: 'processWebhookPayload',
                azureDevOpsId: payload.resource.id,
                error: error.message || 'Unknown error',
                stack: error.stack,
                retryCount: 0,
                maxRetries: 3,
                resolved: false,
                createdAt: new Date(),
            });
        } finally {
            const endTime = new Date();
            result.endTime = endTime;
            result.duration = endTime.getTime() - startTime.getTime();
        }

        return result;
    }

    private async processWorkItemFromAzure(
        workItem: AzureDevOpsWorkItem,
        tenantId: string,
        config: any,
        result: SyncResult,
    ): Promise<void> {
        const externalId = workItem.id?.toString();
        if (!externalId) {
            throw new Error('Work item ID is required');
        }

        // Check if task already exists
        let existingTask = await this.taskRepository.findOne({
            where: { externalId, tenantId },
        });

        const taskData = this.mapWorkItemToTask(workItem, tenantId, config.fieldMappings);

        if (existingTask) {
            // Update existing task
            await this.updateTaskWithConflictResolution(existingTask, taskData, workItem, result);
            result.itemsUpdated++;
        } else {
            // Create new task
            const newTask = this.taskRepository.create(taskData);
            await this.taskRepository.save(newTask);
            result.itemsCreated++;
            this.logger.debug(`Created new task ${newTask.id} from work item ${workItem.id}`);
        }
    }

    private async processTaskToAzure(
        task: Task,
        config: any,
        result: SyncResult,
    ): Promise<void> {
        const workItemData = this.mapTaskToWorkItem(task, config.fieldMappings);

        if (task.externalId) {
            // Update existing work item
            const operations = this.createUpdateOperations(workItemData);
            
            try {
                await this.azureDevOpsClient.updateWorkItem(
                    config.organization,
                    config.project,
                    parseInt(task.externalId),
                    operations
                );
                result.itemsUpdated++;
                this.logger.debug(`Updated work item ${task.externalId} from task ${task.id}`);
            } catch (error) {
                if (error.status === 404) {
                    // Work item doesn't exist in Azure DevOps, create it
                    await this.createWorkItemFromTask(task, config, result);
                } else {
                    throw error;
                }
            }
        } else {
            // Create new work item
            await this.createWorkItemFromTask(task, config, result);
        }
    }

    private async createWorkItemFromTask(
        task: Task,
        config: any,
        result: SyncResult,
    ): Promise<void> {
        const workItemData = this.mapTaskToWorkItem(task, config.fieldMappings);
        const operations = this.createCreateOperations(workItemData);

        const createdWorkItem = await this.azureDevOpsClient.createWorkItem(
            config.organization,
            config.project,
            config.workItemType,
            operations
        );

        // Update task with external ID
        task.externalId = createdWorkItem.id?.toString();
        await this.taskRepository.save(task);
        
        result.itemsCreated++;
        this.logger.debug(`Created work item ${createdWorkItem.id} from task ${task.id}`);
    }

    private async updateTaskWithConflictResolution(
        existingTask: Task,
        newTaskData: Partial<Task>,
        workItem: AzureDevOpsWorkItem,
        result: SyncResult,
    ): Promise<void> {
        // Detect conflicts
        const conflicts = await this.conflictResolver.detectConflicts(
            existingTask as any,
            newTaskData as any,
            existingTask.updatedAt,
            new Date(workItem.fields['System.ChangedDate'] || workItem.fields['System.CreatedDate'])
        );

        if (conflicts.length === 0) {
            // No conflicts, update directly
            Object.assign(existingTask, newTaskData);
            await this.taskRepository.save(existingTask);
            this.logger.debug(`Updated task ${existingTask.id} without conflicts`);
            return;
        }

        // Resolve conflicts
        const resolvedData = { ...newTaskData };
        for (const conflict of conflicts) {
            try {
                const resolution = await this.conflictResolver.resolveConflict(conflict);
                
                if (resolution.resolved) {
                    resolvedData[conflict.field] = resolution.resolvedValue;
                } else {
                    // Add to conflicts for manual review
                    result.conflicts.push({
                        id: `conflict_${Date.now()}`,
                        taskId: existingTask.id,
                        azureDevOpsId: workItem.id!,
                        field: conflict.field,
                        localValue: conflict.localValue,
                        remoteValue: conflict.remoteValue,
                        lastModifiedLocal: conflict.localLastModified,
                        lastModifiedRemote: conflict.remoteLastModified,
                        resolutionPolicy: conflict.policy,
                        resolved: false,
                        createdAt: new Date(),
                    });
                }
            } catch (error) {
                this.logger.error(`Error resolving conflict for field ${conflict.field}:`, error);
            }
        }

        // Apply resolved changes
        Object.assign(existingTask, resolvedData);
        await this.taskRepository.save(existingTask);
        
        this.logger.debug(`Updated task ${existingTask.id} with ${conflicts.length} conflicts resolved`);
    }

    private mapWorkItemToTask(
        workItem: AzureDevOpsWorkItem,
        tenantId: string,
        fieldMappings: FieldMappingConfig[],
    ): Partial<Task> {
        const task: Partial<Task> = {
            tenantId,
            externalId: workItem.id?.toString(),
        };

        for (const mapping of fieldMappings) {
            if (mapping.direction === SyncDirection.ONE_WAY_TO_AZURE) continue;

            const azureValue = workItem.fields[mapping.azureDevOpsField];
            let transformedValue = azureValue;

            if (mapping.transformer?.fromAzureDevOps) {
                try {
                    transformedValue = mapping.transformer.fromAzureDevOps(azureValue);
                } catch (error) {
                    this.logger.warn(`Error transforming field ${mapping.azureDevOpsField}:`, error);
                    transformedValue = mapping.defaultValue;
                }
            }

            if (transformedValue !== undefined) {
                (task as any)[mapping.taskField] = transformedValue;
            }
        }

        return task;
    }

    private mapTaskToWorkItem(
        task: Task,
        fieldMappings: FieldMappingConfig[],
    ): Record<string, any> {
        const workItem: Record<string, any> = {};

        for (const mapping of fieldMappings) {
            if (mapping.direction === SyncDirection.ONE_WAY_FROM_AZURE) continue;

            const taskValue = (task as any)[mapping.taskField];
            let transformedValue = taskValue;

            if (mapping.transformer?.toAzureDevOps) {
                try {
                    transformedValue = mapping.transformer.toAzureDevOps(taskValue);
                } catch (error) {
                    this.logger.warn(`Error transforming field ${mapping.taskField}:`, error);
                    transformedValue = mapping.defaultValue;
                }
            }

            if (transformedValue !== undefined) {
                workItem[mapping.azureDevOpsField] = transformedValue;
            }
        }

        return workItem;
    }

    private createCreateOperations(workItemData: Record<string, any>): CreateWorkItemRequest[] {
        const operations: CreateWorkItemRequest[] = [];

        for (const [field, value] of Object.entries(workItemData)) {
            if (value !== undefined) {
                operations.push({
                    op: 'add',
                    path: `/fields/${field}`,
                    value,
                });
            }
        }

        return operations;
    }

    private createUpdateOperations(workItemData: Record<string, any>): CreateWorkItemRequest[] {
        const operations: CreateWorkItemRequest[] = [];

        for (const [field, value] of Object.entries(workItemData)) {
            if (value !== undefined) {
                operations.push({
                    op: 'replace',
                    path: `/fields/${field}`,
                    value,
                });
            }
        }

        return operations;
    }

    private buildWorkItemQuery(config: any): string {
        let wiql = `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${config.project}'`;

        if (config.filters.includeWorkItemTypes?.length) {
            const types = config.filters.includeWorkItemTypes.map(t => `'${t}'`).join(',');
            wiql += ` AND [System.WorkItemType] IN (${types})`;
        }

        if (config.filters.includeStates?.length) {
            const states = config.filters.includeStates.map(s => `'${s}'`).join(',');
            wiql += ` AND [System.State] IN (${states})`;
        }

        if (config.filters.lastModifiedAfter) {
            const date = config.filters.lastModifiedAfter.toISOString();
            wiql += ` AND [System.ChangedDate] >= '${date}'`;
        }

        wiql += ' ORDER BY [System.ChangedDate] DESC';

        return wiql;
    }

    getSyncStatus(): SyncStatus {
        return { ...this.currentSyncStatus };
    }

    async queueSync(operation: SyncOperation, tenantId: string, userId?: string): Promise<string> {
        const priority = this.queueService.isPriorityOperation(operation) ? 10 : 1;
        
        return this.queueService.enqueue(operation, {
            tenantId,
            userId,
            timestamp: new Date(),
        }, priority);
    }

    getQueueStats() {
        return this.queueService.getQueueStats();
    }
}