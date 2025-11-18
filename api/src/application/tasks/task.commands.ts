import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../repositories/task.repository.interface';
import { ITaskCommands } from './interfaces/task-commands.interface';
import { ITaskQueries, TASK_QUERIES } from './interfaces/task-queries.interface';
import { TaskDto } from './dto/task.dto';
import { CreateTaskDto, CreateTaskFromAzureDto } from './dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskFromAzureDto } from './dto/update-task.dto';

@Injectable()
export class TaskCommands implements ITaskCommands {
    private readonly logger = new Logger(TaskCommands.name);

    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: ITaskRepository,
        @Inject(TASK_QUERIES)
        private readonly taskQueries: ITaskQueries,
    ) {}

    async createTask(dto: CreateTaskDto, tenantId: string, createdById?: string): Promise<TaskDto> {
        try {
            const task = await this.taskRepository.create(dto, tenantId, createdById);
            return await this.taskQueries.findTaskById(task.id);
        } catch (error) {
            this.logger.error(`Failed to create task: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to create task');
        }
    }

    async createTaskFromAzure(
        dto: CreateTaskFromAzureDto,
        tenantId: string,
        createdById?: string,
    ): Promise<TaskDto> {
        try {
            const existingTask = await this.taskRepository.findByAzureDevOpsId(dto.azureDevOpsId, tenantId);
            
            if (existingTask) {
                throw new BadRequestException(
                    `Task with Azure DevOps ID ${dto.azureDevOpsId} already exists`,
                );
            }

            const task = await this.taskRepository.create(
                {
                    ...dto,
                    lastSyncAt: new Date(),
                },
                tenantId,
                createdById,
            );

            return await this.taskQueries.findTaskById(task.id);
        } catch (error) {
            this.logger.error(`Failed to create task from Azure DevOps: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create task from Azure DevOps');
        }
    }

    async updateTask(
        id: string,
        dto: UpdateTaskDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TaskDto> {
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (!isSuperAdmin && tenantId !== undefined && existingTask.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to task from different tenant.');
        }

        try {
            const updatedTask = await this.taskRepository.update(id, dto);

            if (!updatedTask) {
                throw new NotFoundException(`Task with ID ${id} not found after update`);
            }

            return await this.taskQueries.findTaskById(updatedTask.id);
        } catch (error) {
            this.logger.error(`Failed to update task: ${error.message}`, error.stack);
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            throw new BadRequestException('Failed to update task');
        }
    }

    async updateTaskFromAzure(id: string, dto: UpdateTaskFromAzureDto, tenantId: string): Promise<TaskDto> {
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (existingTask.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to task from different tenant.');
        }

        try {
            const updatedTask = await this.taskRepository.update(id, {
                ...dto,
                lastSyncAt: new Date(),
                syncError: null,
            });

            if (!updatedTask) {
                throw new NotFoundException(`Task with ID ${id} not found after update`);
            }

            return await this.taskQueries.findTaskById(updatedTask.id);
        } catch (error) {
            this.logger.error(`Failed to update task from Azure DevOps: ${error.message}`, error.stack);
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            throw new BadRequestException('Failed to update task from Azure DevOps');
        }
    }

    async deleteTask(id: string, tenantId?: string, isSuperAdmin?: boolean): Promise<void> {
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (!isSuperAdmin && tenantId !== undefined && existingTask.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to task from different tenant.');
        }

        const deleted = await this.taskRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(`Task with ID ${id} could not be deleted`);
        }
    }

    async syncTaskWithAzure(id: string): Promise<TaskDto> {
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (!existingTask.azureDevOpsId) {
            throw new BadRequestException('Task is not linked to Azure DevOps');
        }

        return await this.taskQueries.findTaskById(id);
    }
}