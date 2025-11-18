import {
    Injectable,
    Logger,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AzureDevOpsOAuthService } from '../auth/azure-devops-oauth.service';
import {
    AzureWorkItemDto,
    CreateAzureWorkItemDto,
    UpdateAzureWorkItemDto,
    AzureWorkItemPatchOperation,
} from '../dto/work-item.dto';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

@Injectable()
export class AzureDevOpsApiService {
    private readonly logger = new Logger(AzureDevOpsApiService.name);
    private readonly baseUrl = 'https://dev.azure.com';
    private readonly apiVersion = '7.1';

    constructor(private readonly oauthService: AzureDevOpsOAuthService) {}

    private async createAuthenticatedClient(tenantId: string): Promise<AxiosInstance> {
        const token = await this.oauthService.getValidToken(tenantId);
        
        if (!token) {
            throw new BadRequestException('Azure DevOps authentication required');
        }

        return axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${token.accessToken}`,
                'Content-Type': 'application/json',
            },
            params: {
                'api-version': this.apiVersion,
            },
        });
    }

    async getWorkItem(tenantId: string, organization: string, workItemId: number): Promise<AzureWorkItemDto> {
        try {
            const client = await this.createAuthenticatedClient(tenantId);
            const url = `/${organization}/_apis/wit/workitems/${workItemId}`;
            
            const response: AxiosResponse<AzureWorkItemDto> = await client.get(url, {
                params: {
                    '$expand': 'all',
                    'api-version': this.apiVersion,
                },
            });

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get work item ${workItemId}: ${error.message}`, error.stack);
            
            if (error.response?.status === 404) {
                throw new NotFoundException(`Work item ${workItemId} not found`);
            }
            
            throw new InternalServerErrorException('Failed to get work item from Azure DevOps');
        }
    }

    async createWorkItem(
        tenantId: string,
        organization: string,
        project: string,
        dto: CreateAzureWorkItemDto,
    ): Promise<AzureWorkItemDto> {
        try {
            const client = await this.createAuthenticatedClient(tenantId);
            const workItemType = dto.workItemType || 'Task';
            const url = `/${organization}/${project}/_apis/wit/workitems/$${workItemType}`;

            const operations: AzureWorkItemPatchOperation[] = [
                {
                    op: 'add',
                    path: '/fields/System.Title',
                    value: dto.title,
                },
            ];

            if (dto.description) {
                operations.push({
                    op: 'add',
                    path: '/fields/System.Description',
                    value: dto.description,
                });
            }

            if (dto.priority !== undefined) {
                operations.push({
                    op: 'add',
                    path: '/fields/System.Priority',
                    value: dto.priority,
                });
            }

            if (dto.assignedTo) {
                operations.push({
                    op: 'add',
                    path: '/fields/System.AssignedTo',
                    value: dto.assignedTo,
                });
            }

            const response: AxiosResponse<AzureWorkItemDto> = await client.post(url, operations, {
                headers: {
                    'Content-Type': 'application/json-patch+json',
                },
                params: {
                    'api-version': this.apiVersion,
                },
            });

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to create work item: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create work item in Azure DevOps');
        }
    }

    async updateWorkItem(
        tenantId: string,
        organization: string,
        workItemId: number,
        dto: UpdateAzureWorkItemDto,
    ): Promise<AzureWorkItemDto> {
        try {
            const client = await this.createAuthenticatedClient(tenantId);
            const url = `/${organization}/_apis/wit/workitems/${workItemId}`;

            const operations: AzureWorkItemPatchOperation[] = [];

            if (dto.title !== undefined) {
                operations.push({
                    op: 'replace',
                    path: '/fields/System.Title',
                    value: dto.title,
                });
            }

            if (dto.description !== undefined) {
                operations.push({
                    op: 'replace',
                    path: '/fields/System.Description',
                    value: dto.description,
                });
            }

            if (dto.state !== undefined) {
                operations.push({
                    op: 'replace',
                    path: '/fields/System.State',
                    value: dto.state,
                });
            }

            if (dto.priority !== undefined) {
                operations.push({
                    op: 'replace',
                    path: '/fields/System.Priority',
                    value: dto.priority,
                });
            }

            if (dto.assignedTo !== undefined) {
                if (dto.assignedTo === '') {
                    operations.push({
                        op: 'remove',
                        path: '/fields/System.AssignedTo',
                    });
                } else {
                    operations.push({
                        op: 'replace',
                        path: '/fields/System.AssignedTo',
                        value: dto.assignedTo,
                    });
                }
            }

            if (operations.length === 0) {
                throw new BadRequestException('No fields to update');
            }

            const response: AxiosResponse<AzureWorkItemDto> = await client.patch(url, operations, {
                headers: {
                    'Content-Type': 'application/json-patch+json',
                },
                params: {
                    'api-version': this.apiVersion,
                },
            });

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to update work item ${workItemId}: ${error.message}`, error.stack);
            
            if (error.response?.status === 404) {
                throw new NotFoundException(`Work item ${workItemId} not found`);
            }
            
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to update work item in Azure DevOps');
        }
    }

    async deleteWorkItem(tenantId: string, organization: string, workItemId: number): Promise<void> {
        try {
            const client = await this.createAuthenticatedClient(tenantId);
            const url = `/${organization}/_apis/wit/workitems/${workItemId}`;

            await client.delete(url, {
                params: {
                    'api-version': this.apiVersion,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to delete work item ${workItemId}: ${error.message}`, error.stack);
            
            if (error.response?.status === 404) {
                throw new NotFoundException(`Work item ${workItemId} not found`);
            }
            
            throw new InternalServerErrorException('Failed to delete work item in Azure DevOps');
        }
    }

    async getWorkItemsByProject(
        tenantId: string,
        organization: string,
        project: string,
        top: number = 200,
    ): Promise<AzureWorkItemDto[]> {
        try {
            const client = await this.createAuthenticatedClient(tenantId);
            const query = `SELECT [System.Id], [System.Title], [System.State] FROM workitems WHERE [System.TeamProject] = '${project}' ORDER BY [System.ChangedDate] DESC`;
            
            const queryUrl = `/${organization}/${project}/_apis/wit/wiql`;
            const queryResponse = await client.post(
                queryUrl,
                { query },
                {
                    params: {
                        '$top': top,
                        'api-version': this.apiVersion,
                    },
                }
            );

            const workItemIds = queryResponse.data.workItems?.map((item: any) => item.id) || [];
            
            if (workItemIds.length === 0) {
                return [];
            }

            const batchUrl = `/${organization}/_apis/wit/workitems`;
            const batchResponse: AxiosResponse<{ value: AzureWorkItemDto[] }> = await client.get(
                batchUrl,
                {
                    params: {
                        ids: workItemIds.join(','),
                        '$expand': 'all',
                        'api-version': this.apiVersion,
                    },
                }
            );

            return batchResponse.data.value || [];
        } catch (error) {
            this.logger.error(`Failed to get work items for project ${project}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to get work items from Azure DevOps');
        }
    }

    mapAzureStatusToTaskStatus(azureState: string): TaskStatus {
        const stateMapping: { [key: string]: TaskStatus } = {
            'New': TaskStatus.NEW,
            'Active': TaskStatus.ACTIVE,
            'Resolved': TaskStatus.RESOLVED,
            'Closed': TaskStatus.CLOSED,
            'Removed': TaskStatus.REMOVED,
        };

        return stateMapping[azureState] || TaskStatus.NEW;
    }

    mapTaskStatusToAzureStatus(taskStatus: TaskStatus): string {
        const statusMapping: { [key in TaskStatus]: string } = {
            [TaskStatus.NEW]: 'New',
            [TaskStatus.ACTIVE]: 'Active',
            [TaskStatus.RESOLVED]: 'Resolved',
            [TaskStatus.CLOSED]: 'Closed',
            [TaskStatus.REMOVED]: 'Removed',
        };

        return statusMapping[taskStatus];
    }

    mapAzurePriorityToTaskPriority(azurePriority: number): TaskPriority {
        if (azurePriority >= 4) return TaskPriority.CRITICAL;
        if (azurePriority === 3) return TaskPriority.HIGH;
        if (azurePriority === 2) return TaskPriority.MEDIUM;
        return TaskPriority.LOW;
    }

    mapTaskPriorityToAzurePriority(taskPriority: TaskPriority): number {
        return taskPriority as number;
    }
}