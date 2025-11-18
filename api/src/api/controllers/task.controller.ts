import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    HttpCode,
    HttpStatus,
    Inject,
    ForbiddenException,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiBody,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiQuery,
} from '@nestjs/swagger';
import {
    ITaskCommands,
    TASK_COMMANDS,
} from '../../application/tasks/interfaces/task-commands.interface';
import {
    ITaskQueries,
    TASK_QUERIES,
} from '../../application/tasks/interfaces/task-queries.interface';
import { CreateTaskDto } from '../../application/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../../application/tasks/dto/update-task.dto';
import { TaskDto } from '../../application/tasks/dto/task.dto';
import { TaskPaginationDto } from '../../application/tasks/dto/pagination.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { AzureDevOpsSyncService, SyncResult, BulkSyncResult } from '../../application/tasks/sync/azure-devops-sync.service';

interface RequestingUserContext {
    isSuperAdmin: boolean;
    tenantId?: string;
    userId?: string;
}

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@Authorize()
export class TaskController {
    constructor(
        @Inject(TASK_COMMANDS) private readonly taskCommands: ITaskCommands,
        @Inject(TASK_QUERIES) private readonly taskQueries: ITaskQueries,
        private readonly syncService: AzureDevOpsSyncService,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;
        const userId: string | undefined = req.userId;

        return { isSuperAdmin, tenantId, userId };
    }

    @Post()
    @Authorize(RoleName.ADMIN, RoleName.USER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a task', description: 'Creates a new task within the tenant' })
    @ApiBody({ type: CreateTaskDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Task created successfully',
        type: TaskDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires user role or missing tenant information',
    })
    async create(
        @Body() createTaskDto: CreateTaskDto,
        @Req() req: RequestWithTenant,
    ): Promise<TaskDto> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User must belong to a tenant.');
        }

        return this.taskCommands.createTask(createTaskDto, tenantId, userId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all tasks',
        description: 'Retrieves all tasks based on role permissions with pagination',
    })
    @ApiQuery({
        name: 'page',
        description: 'Page number',
        example: 1,
        required: false,
    })
    @ApiQuery({
        name: 'limit',
        description: 'Items per page',
        example: 10,
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of tasks retrieved successfully',
        type: TaskPaginationDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(
        @Req() req: RequestWithTenant,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<TaskPaginationDto> {
        const { tenantId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.taskQueries.findAllTasksByTenant(tenantId, page || 1, limit || 10);
    }

    @Get('my-tasks')
    @ApiOperation({
        summary: 'Get tasks assigned to current user',
        description: 'Retrieves tasks assigned to the current user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of assigned tasks retrieved successfully',
        type: [TaskDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findMyTasks(@Req() req: RequestWithTenant): Promise<TaskDto[]> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined || userId === undefined) {
            throw new ForbiddenException('User tenant and user information is missing.');
        }

        return this.taskQueries.findTasksByAssignedUser(userId, tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get task by ID', description: 'Retrieves a specific task by ID' })
    @ApiParam({
        name: 'id',
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Task retrieved successfully',
        type: TaskDto,
    })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<TaskDto> {
        const { tenantId } = this._getRequestingUserContext(req);

        return this.taskQueries.findTaskById(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update task', description: 'Updates an existing task' })
    @ApiParam({
        name: 'id',
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateTaskDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Task updated successfully', type: TaskDto })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - task not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @Req() req: RequestWithTenant,
    ): Promise<TaskDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        return this.taskCommands.updateTask(id, updateTaskDto, tenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete task', description: 'Deletes a task' })
    @ApiParam({
        name: 'id',
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Task deleted successfully' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        return this.taskCommands.deleteTask(id, tenantId, isSuperAdmin);
    }

    @Post(':id/sync-to-azure')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sync task to Azure DevOps',
        description: 'Synchronizes a task to Azure DevOps work item',
    })
    @ApiParam({
        name: 'id',
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Task synchronized successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                azureWorkItemId: { type: 'number' },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async syncToAzure(@Param('id') id: string): Promise<SyncResult> {
        return this.syncService.syncTaskToAzure(id);
    }

    @Post('sync-from-azure/:azureWorkItemId')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sync from Azure DevOps work item',
        description: 'Synchronizes an Azure DevOps work item to a task',
    })
    @ApiParam({
        name: 'azureWorkItemId',
        description: 'Azure DevOps work item ID',
        example: 12345,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Work item synchronized successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                taskId: { type: 'string' },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async syncFromAzure(
        @Param('azureWorkItemId', ParseIntPipe) azureWorkItemId: number,
        @Req() req: RequestWithTenant,
    ): Promise<SyncResult> {
        const { tenantId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.syncService.syncTaskFromAzure(tenantId, azureWorkItemId);
    }

    @Post('bulk-sync-to-azure')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Bulk sync tasks to Azure DevOps',
        description: 'Synchronizes all pending tasks to Azure DevOps work items',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bulk synchronization completed',
        schema: {
            type: 'object',
            properties: {
                totalProcessed: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
                results: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            taskId: { type: 'string' },
                            azureWorkItemId: { type: 'number' },
                        },
                    },
                },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async bulkSyncToAzure(@Req() req: RequestWithTenant): Promise<BulkSyncResult> {
        const { tenantId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.syncService.bulkSyncToAzure(tenantId);
    }

    @Post('bulk-sync-from-azure')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Bulk sync from Azure DevOps',
        description: 'Synchronizes all Azure DevOps work items to tasks',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bulk synchronization completed',
        schema: {
            type: 'object',
            properties: {
                totalProcessed: { type: 'number' },
                successful: { type: 'number' },
                failed: { type: 'number' },
                results: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            taskId: { type: 'string' },
                            azureWorkItemId: { type: 'number' },
                        },
                    },
                },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async bulkSyncFromAzure(@Req() req: RequestWithTenant): Promise<BulkSyncResult> {
        const { tenantId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.syncService.bulkSyncFromAzure(tenantId);
    }
}