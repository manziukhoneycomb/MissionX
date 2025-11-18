import { TaskDto } from '../dto/task.dto';
import { TaskPaginationDto } from '../dto/pagination.dto';

export const TASK_QUERIES = 'TASK_QUERIES';

export interface ITaskQueries {
    findAllTasksByTenant(tenantId: string, page?: number, limit?: number): Promise<TaskPaginationDto>;
    findTaskById(id: string, requestingUserTenantId?: string): Promise<TaskDto>;
    findTasksByAssignedUser(assignedUserId: string, tenantId: string): Promise<TaskDto[]>;
    findTaskByAzureDevOpsId(azureDevOpsId: number, tenantId: string): Promise<TaskDto | null>;
}