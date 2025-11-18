import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskResponseDto } from '../dto/task-response.dto';
import { TaskQueryDto, TaskPaginationResponseDto } from '../dto/task-query.dto';

export interface ITaskService {
    createTask(dto: CreateTaskDto, tenantId: string): Promise<TaskResponseDto>;
    findTaskById(id: string, tenantId?: string): Promise<TaskResponseDto>;
    findTaskByExternalId(externalId: string): Promise<TaskResponseDto>;
    findAllTasks(tenantId?: string, query?: TaskQueryDto): Promise<TaskPaginationResponseDto>;
    updateTask(id: string, dto: UpdateTaskDto, tenantId?: string): Promise<TaskResponseDto>;
    deleteTask(id: string, tenantId?: string): Promise<void>;
}

export const TASK_SERVICE = 'ITaskService';