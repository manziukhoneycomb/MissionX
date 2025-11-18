import { Task } from '../../domain/entities/task.entity';
import { CreateTaskDto, CreateTaskFromAzureDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskFromAzureDto } from '../tasks/dto/update-task.dto';

export const TASK_REPOSITORY = 'TASK_REPOSITORY';

export interface ITaskRepository {
    findById(id: string): Promise<Task | null>;
    findByAzureDevOpsId(azureDevOpsId: number, tenantId: string): Promise<Task | null>;
    findAllByTenantId(tenantId: string, page?: number, limit?: number): Promise<{ tasks: Task[]; total: number }>;
    findByAssignedUserId(assignedUserId: string, tenantId: string): Promise<Task[]>;
    create(dto: CreateTaskDto | CreateTaskFromAzureDto, tenantId: string, createdById?: string): Promise<Task>;
    update(id: string, dto: UpdateTaskDto | UpdateTaskFromAzureDto): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
    findTasksNeedingSync(tenantId: string): Promise<Task[]>;
    updateSyncStatus(id: string, lastSyncAt: Date, syncError?: string): Promise<void>;
}