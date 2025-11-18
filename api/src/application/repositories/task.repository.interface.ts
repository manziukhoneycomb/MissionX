import { Task } from '../../domain/entities/task.entity';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';
import { TaskQueryDto, TaskPaginationResponseDto } from '../tasks/dto/task-query.dto';

export interface ITaskRepository {
    findById(id: string): Promise<Task | null>;
    findByExternalId(externalId: string): Promise<Task | null>;
    findAllByTenantId(
        tenantId: string,
        query?: TaskQueryDto,
    ): Promise<TaskPaginationResponseDto>;
    findAll(query?: TaskQueryDto): Promise<TaskPaginationResponseDto>;
    create(dto: CreateTaskDto, tenantId: string): Promise<Task>;
    update(id: string, dto: UpdateTaskDto): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
}

export const TASK_REPOSITORY = 'ITaskRepository';