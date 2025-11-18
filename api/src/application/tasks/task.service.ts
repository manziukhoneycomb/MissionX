import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ITaskService } from './interfaces/task.service.interface';
import { ITaskRepository, TASK_REPOSITORY } from '../repositories/task.repository.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskQueryDto, TaskPaginationResponseDto } from './dto/task-query.dto';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class TaskService implements ITaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: ITaskRepository,
    ) {}

    async createTask(dto: CreateTaskDto, tenantId: string): Promise<TaskResponseDto> {
        this.logger.log(`Creating task: ${dto.title} for tenant: ${tenantId}`);
        
        const task = await this.taskRepository.create(dto, tenantId);
        return this.mapTaskToResponse(task);
    }

    async findTaskById(id: string, tenantId?: string): Promise<TaskResponseDto> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (tenantId && task.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to task from different tenant');
        }

        return this.mapTaskToResponse(task);
    }

    async findTaskByExternalId(externalId: string): Promise<TaskResponseDto> {
        const task = await this.taskRepository.findByExternalId(externalId);

        if (!task) {
            throw new NotFoundException(`Task with external ID ${externalId} not found`);
        }

        return this.mapTaskToResponse(task);
    }

    async findAllTasks(
        tenantId?: string,
        query?: TaskQueryDto,
    ): Promise<TaskPaginationResponseDto> {
        let result: TaskPaginationResponseDto;

        if (tenantId) {
            result = await this.taskRepository.findAllByTenantId(tenantId, query);
        } else {
            result = await this.taskRepository.findAll(query);
        }

        return {
            ...result,
            data: result.data.map((task) => this.mapTaskToResponse(task)),
        };
    }

    async updateTask(
        id: string,
        dto: UpdateTaskDto,
        tenantId?: string,
    ): Promise<TaskResponseDto> {
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (tenantId && existingTask.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to task from different tenant');
        }

        this.logger.log(`Updating task: ${id}`);

        const updatedTask = await this.taskRepository.update(id, dto);
        
        if (!updatedTask) {
            throw new NotFoundException(`Task with ID ${id} not found after update`);
        }

        return this.mapTaskToResponse(updatedTask);
    }

    async deleteTask(id: string, tenantId?: string): Promise<void> {
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (tenantId && existingTask.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to task from different tenant');
        }

        this.logger.log(`Deleting task: ${id}`);

        const deleted = await this.taskRepository.delete(id);
        
        if (!deleted) {
            throw new NotFoundException(`Task with ID ${id} could not be deleted`);
        }
    }

    private mapTaskToResponse(task: Task): TaskResponseDto {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            assignee: task.assignee ? {
                id: task.assignee.id,
                email: task.assignee.email,
                firstName: task.assignee.firstName,
                lastName: task.assignee.lastName,
                isActive: task.assignee.isActive,
                tenantId: task.assignee.tenantId,
                createdAt: task.assignee.createdAt,
                updatedAt: task.assignee.updatedAt,
            } : undefined,
            projectId: task.projectId,
            externalId: task.externalId,
            tenantId: task.tenantId,
            metadata: task.metadata,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        };
    }
}