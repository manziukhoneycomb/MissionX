import {
    Injectable,
    Logger,
    Inject,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../../application/repositories/task.repository.interface';
import { ITaskCommands, TASK_COMMANDS } from '../interfaces/task-commands.interface';
import { ITaskQueries, TASK_QUERIES } from '../interfaces/task-queries.interface';
import { AzureDevOpsApiService } from '../../../infrastructure/azure-devops/api/azure-devops-api.service';
import { AzureDevOpsOAuthService } from '../../../infrastructure/azure-devops/auth/azure-devops-oauth.service';
import { Task } from '../../../domain/entities/task.entity';
import { AzureWorkItemDto } from '../../../infrastructure/azure-devops/dto/work-item.dto';
import { CreateTaskFromAzureDto } from '../dto/create-task.dto';
import { UpdateTaskFromAzureDto } from '../dto/update-task.dto';
import { TaskDto } from '../dto/task.dto';

export interface SyncResult {
    success: boolean;
    message: string;
    taskId?: string;
    azureWorkItemId?: number;
}

export interface BulkSyncResult {
    totalProcessed: number;
    successful: number;
    failed: number;
    results: SyncResult[];
}

@Injectable()
export class AzureDevOpsSyncService {
    private readonly logger = new Logger(AzureDevOpsSyncService.name);

    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: ITaskRepository,
        @Inject(TASK_COMMANDS)
        private readonly taskCommands: ITaskCommands,
        @Inject(TASK_QUERIES)
        private readonly taskQueries: ITaskQueries,
        private readonly azureDevOpsApiService: AzureDevOpsApiService,
        private readonly oauthService: AzureDevOpsOAuthService,
    ) {}

    async syncTaskToAzure(taskId: string): Promise<SyncResult> {
        try {
            const task = await this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    message: `Task with ID ${taskId} not found`,
                };
            }

            const token = await this.oauthService.getValidToken(task.tenantId);
            
            if (!token) {
                return {
                    success: false,
                    message: 'Azure DevOps authentication not configured for tenant',
                };
            }

            let azureWorkItem: AzureWorkItemDto;

            if (task.azureDevOpsId) {
                azureWorkItem = await this.updateWorkItemInAzure(task, token.organization);
            } else {
                azureWorkItem = await this.createWorkItemInAzure(task, token.organization, token.project!);
            }

            await this.taskRepository.updateSyncStatus(task.id, new Date());

            return {
                success: true,
                message: 'Task synchronized successfully to Azure DevOps',
                taskId: task.id,
                azureWorkItemId: azureWorkItem.id,
            };
        } catch (error) {
            this.logger.error(`Failed to sync task ${taskId} to Azure: ${error.message}`, error.stack);
            
            await this.taskRepository.updateSyncStatus(taskId, new Date(), error.message);
            
            return {
                success: false,
                message: `Failed to sync task: ${error.message}`,
                taskId,
            };
        }
    }

    async syncTaskFromAzure(tenantId: string, azureWorkItemId: number): Promise<SyncResult> {
        try {
            const token = await this.oauthService.getValidToken(tenantId);
            
            if (!token) {
                return {
                    success: false,
                    message: 'Azure DevOps authentication not configured for tenant',
                };
            }

            const azureWorkItem = await this.azureDevOpsApiService.getWorkItem(
                tenantId,
                token.organization,
                azureWorkItemId,
            );

            const existingTask = await this.taskRepository.findByAzureDevOpsId(azureWorkItemId, tenantId);

            if (existingTask) {
                const updatedTask = await this.updateTaskFromAzure(existingTask, azureWorkItem);
                
                return {
                    success: true,
                    message: 'Task updated from Azure DevOps successfully',
                    taskId: updatedTask.id,
                    azureWorkItemId: azureWorkItemId,
                };
            } else {
                const newTask = await this.createTaskFromAzure(tenantId, azureWorkItem);
                
                return {
                    success: true,
                    message: 'Task created from Azure DevOps successfully',
                    taskId: newTask.id,
                    azureWorkItemId: azureWorkItemId,
                };
            }
        } catch (error) {
            this.logger.error(
                `Failed to sync work item ${azureWorkItemId} from Azure: ${error.message}`,
                error.stack,
            );
            
            return {
                success: false,
                message: `Failed to sync from Azure: ${error.message}`,
                azureWorkItemId,
            };
        }
    }

    async bulkSyncFromAzure(tenantId: string): Promise<BulkSyncResult> {
        try {
            const token = await this.oauthService.getValidToken(tenantId);
            
            if (!token) {
                throw new BadRequestException('Azure DevOps authentication not configured for tenant');
            }

            if (!token.project) {
                throw new BadRequestException('Azure DevOps project not configured');
            }

            const azureWorkItems = await this.azureDevOpsApiService.getWorkItemsByProject(
                tenantId,
                token.organization,
                token.project,
            );

            const results: SyncResult[] = [];
            let successful = 0;
            let failed = 0;

            for (const azureWorkItem of azureWorkItems) {
                const result = await this.syncTaskFromAzure(tenantId, azureWorkItem.id);
                results.push(result);
                
                if (result.success) {
                    successful++;
                } else {
                    failed++;
                }
            }

            return {
                totalProcessed: azureWorkItems.length,
                successful,
                failed,
                results,
            };
        } catch (error) {
            this.logger.error(`Failed to bulk sync from Azure: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to perform bulk sync from Azure DevOps');
        }
    }

    async bulkSyncToAzure(tenantId: string): Promise<BulkSyncResult> {
        try {
            const tasksNeedingSync = await this.taskRepository.findTasksNeedingSync(tenantId);
            
            const results: SyncResult[] = [];
            let successful = 0;
            let failed = 0;

            for (const task of tasksNeedingSync) {
                const result = await this.syncTaskToAzure(task.id);
                results.push(result);
                
                if (result.success) {
                    successful++;
                } else {
                    failed++;
                }
            }

            return {
                totalProcessed: tasksNeedingSync.length,
                successful,
                failed,
                results,
            };
        } catch (error) {
            this.logger.error(`Failed to bulk sync to Azure: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to perform bulk sync to Azure DevOps');
        }
    }

    private async createWorkItemInAzure(
        task: Task,
        organization: string,
        project: string,
    ): Promise<AzureWorkItemDto> {
        const createDto = {
            title: task.title,
            description: task.description,
            priority: this.azureDevOpsApiService.mapTaskPriorityToAzurePriority(task.priority),
        };

        const azureWorkItem = await this.azureDevOpsApiService.createWorkItem(
            task.tenantId,
            organization,
            project,
            createDto,
        );

        await this.taskRepository.update(task.id, {
            azureDevOpsId: azureWorkItem.id,
            azureDevOpsUrl: azureWorkItem.url,
            azureDevOpsRev: azureWorkItem.rev,
        });

        return azureWorkItem;
    }

    private async updateWorkItemInAzure(task: Task, organization: string): Promise<AzureWorkItemDto> {
        if (!task.azureDevOpsId) {
            throw new BadRequestException('Task is not linked to Azure DevOps work item');
        }

        const updateDto = {
            title: task.title,
            description: task.description,
            state: this.azureDevOpsApiService.mapTaskStatusToAzureStatus(task.status),
            priority: this.azureDevOpsApiService.mapTaskPriorityToAzurePriority(task.priority),
        };

        const azureWorkItem = await this.azureDevOpsApiService.updateWorkItem(
            task.tenantId,
            organization,
            task.azureDevOpsId,
            updateDto,
        );

        await this.taskRepository.update(task.id, {
            azureDevOpsRev: azureWorkItem.rev,
        });

        return azureWorkItem;
    }

    private async createTaskFromAzure(tenantId: string, azureWorkItem: AzureWorkItemDto): Promise<TaskDto> {
        const fields = azureWorkItem.fields;
        
        const createDto: CreateTaskFromAzureDto = {
            title: fields['System.Title'] || 'Untitled Task',
            description: fields['System.Description'],
            status: this.azureDevOpsApiService.mapAzureStatusToTaskStatus(fields['System.State'] || 'New'),
            priority: this.azureDevOpsApiService.mapAzurePriorityToTaskPriority(fields['System.Priority'] || 2),
            azureDevOpsId: azureWorkItem.id,
            azureDevOpsUrl: azureWorkItem.url,
            azureDevOpsRev: azureWorkItem.rev,
        };

        return await this.taskCommands.createTaskFromAzure(createDto, tenantId);
    }

    private async updateTaskFromAzure(task: Task, azureWorkItem: AzureWorkItemDto): Promise<TaskDto> {
        const fields = azureWorkItem.fields;
        
        if (task.azureDevOpsRev && azureWorkItem.rev <= task.azureDevOpsRev) {
            this.logger.debug(
                `Skipping update for task ${task.id}: Azure revision ${azureWorkItem.rev} is not newer than local revision ${task.azureDevOpsRev}`,
            );
            return await this.taskQueries.findTaskById(task.id);
        }
        
        const updateDto: UpdateTaskFromAzureDto = {
            title: fields['System.Title'],
            description: fields['System.Description'],
            status: this.azureDevOpsApiService.mapAzureStatusToTaskStatus(fields['System.State'] || 'New'),
            priority: this.azureDevOpsApiService.mapAzurePriorityToTaskPriority(fields['System.Priority'] || 2),
            azureDevOpsRev: azureWorkItem.rev,
        };

        return await this.taskCommands.updateTaskFromAzure(task.id, updateDto, task.tenantId);
    }
}