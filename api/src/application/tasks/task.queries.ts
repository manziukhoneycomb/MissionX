import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { ITaskQueries } from './interfaces/task-queries.interface';
import { TaskDto } from './dto/task.dto';
import { TaskPaginationDto } from './dto/pagination.dto';

@Injectable()
export class TaskQueries implements ITaskQueries {
    constructor(
        @Inject(TASK_REPOSITORY)
        private readonly taskRepository: ITaskRepository,
    ) {}

    private mapToDto(task: Task | null): TaskDto | null {
        if (!task) {
            return null;
        }

        const dto = new TaskDto();
        dto.id = task.id;
        dto.title = task.title;
        dto.description = task.description;
        dto.status = task.status;
        dto.priority = task.priority;
        dto.azureDevOpsId = task.azureDevOpsId;
        dto.azureDevOpsUrl = task.azureDevOpsUrl;
        dto.azureDevOpsRev = task.azureDevOpsRev;
        dto.lastSyncAt = task.lastSyncAt;
        dto.syncError = task.syncError;
        dto.assignedUserId = task.assignedUserId;
        dto.createdById = task.createdById;
        dto.createdAt = task.createdAt;
        dto.updatedAt = task.updatedAt;

        if (task.assignedUser) {
            dto.assignedUser = {
                id: task.assignedUser.id,
                email: task.assignedUser.email,
                firstName: task.assignedUser.firstName,
                lastName: task.assignedUser.lastName,
            };
        }

        if (task.createdBy) {
            dto.createdBy = {
                id: task.createdBy.id,
                email: task.createdBy.email,
                firstName: task.createdBy.firstName,
                lastName: task.createdBy.lastName,
            };
        }

        return dto;
    }

    async findAllTasksByTenant(
        tenantId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<TaskPaginationDto> {
        const { tasks, total } = await this.taskRepository.findAllByTenantId(tenantId, page, limit);

        const taskDtos = tasks.map((task) => this.mapToDto(task)).filter(Boolean) as TaskDto[];
        const totalPages = Math.ceil(total / limit);

        return {
            tasks: taskDtos,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findTaskById(id: string, requestingUserTenantId?: string): Promise<TaskDto> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        if (requestingUserTenantId !== undefined && task.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Access denied to task from different tenant.');
        }

        const dto = this.mapToDto(task);

        if (!dto) {
            throw new InternalServerErrorException('Failed to map found task.');
        }

        return dto;
    }

    async findTasksByAssignedUser(assignedUserId: string, tenantId: string): Promise<TaskDto[]> {
        const tasks = await this.taskRepository.findByAssignedUserId(assignedUserId, tenantId);

        return tasks.map((task) => this.mapToDto(task)).filter(Boolean) as TaskDto[];
    }

    async findTaskByAzureDevOpsId(azureDevOpsId: number, tenantId: string): Promise<TaskDto | null> {
        const task = await this.taskRepository.findByAzureDevOpsId(azureDevOpsId, tenantId);

        return this.mapToDto(task);
    }
}