import { TaskDto } from '../dto/task.dto';
import { CreateTaskDto, CreateTaskFromAzureDto } from '../dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskFromAzureDto } from '../dto/update-task.dto';

export const TASK_COMMANDS = 'TASK_COMMANDS';

export interface ITaskCommands {
    createTask(dto: CreateTaskDto, tenantId: string, createdById?: string): Promise<TaskDto>;
    createTaskFromAzure(dto: CreateTaskFromAzureDto, tenantId: string, createdById?: string): Promise<TaskDto>;
    updateTask(id: string, dto: UpdateTaskDto, tenantId?: string, isSuperAdmin?: boolean): Promise<TaskDto>;
    updateTaskFromAzure(id: string, dto: UpdateTaskFromAzureDto, tenantId: string): Promise<TaskDto>;
    deleteTask(id: string, tenantId?: string, isSuperAdmin?: boolean): Promise<void>;
    syncTaskWithAzure(id: string): Promise<TaskDto>;
}