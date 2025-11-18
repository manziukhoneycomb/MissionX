import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Req,
    HttpCode,
    HttpStatus,
    Inject,
    ForbiddenException,
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
import { ITaskService, TASK_SERVICE } from '../../application/tasks/interfaces/task.service.interface';
import { CreateTaskDto } from '../../application/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../../application/tasks/dto/update-task.dto';
import { TaskResponseDto } from '../../application/tasks/dto/task-response.dto';
import { TaskQueryDto, TaskPaginationResponseDto } from '../../application/tasks/dto/task-query.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from 'src/infrastructure/middleware/request-with-tenant.interface';

interface RequestingUserContext {
    isSuperAdmin: boolean;
    tenantId?: string;
}

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@Authorize()
export class TaskController {
    constructor(
        @Inject(TASK_SERVICE) private readonly taskService: ITaskService,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Create a new task', 
        description: 'Creates a new task within the tenant' 
    })
    @ApiBody({ type: CreateTaskDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Task created successfully',
        type: TaskResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async create(
        @Body() createTaskDto: CreateTaskDto,
        @Req() req: RequestWithTenant,
    ): Promise<TaskResponseDto> {
        const { tenantId, isSuperAdmin }: RequestingUserContext = 
            this._getRequestingUserContext(req);

        if (!isSuperAdmin && !tenantId) {
            throw new ForbiddenException('Tenant information is required');
        }

        const effectiveTenantId = tenantId || req.tenantId!;
        return this.taskService.createTask(createTaskDto, effectiveTenantId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all tasks',
        description: 'Retrieves all tasks based on role permissions and query filters',
    })
    @ApiQuery({ type: TaskQueryDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of tasks retrieved successfully',
        type: TaskPaginationResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(
        @Query() query: TaskQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<TaskPaginationResponseDto> {
        const { tenantId, isSuperAdmin }: RequestingUserContext =
            this._getRequestingUserContext(req);

        if (isSuperAdmin) {
            return this.taskService.findAllTasks(undefined, query);
        }

        if (tenantId) {
            return this.taskService.findAllTasks(tenantId, query);
        }

        throw new ForbiddenException('Tenant information is missing.');
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get task by ID', 
        description: 'Retrieves a specific task by ID' 
    })
    @ApiParam({
        name: 'id',
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Task retrieved successfully',
        type: TaskResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - task not in same tenant' })
    async findOne(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TaskResponseDto> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.taskService.findTaskById(id, tenantId);
    }

    @Get('external/:externalId')
    @ApiOperation({ 
        summary: 'Get task by external ID', 
        description: 'Retrieves a specific task by external system ID' 
    })
    @ApiParam({
        name: 'externalId',
        description: 'External system ID (e.g., Azure DevOps work item ID)',
        example: 'ADO-12345',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Task retrieved successfully',
        type: TaskResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findByExternalId(
        @Param('externalId') externalId: string,
    ): Promise<TaskResponseDto> {
        return this.taskService.findTaskByExternalId(externalId);
    }

    @Patch(':id')
    @ApiOperation({ 
        summary: 'Update task', 
        description: 'Updates an existing task' 
    })
    @ApiParam({
        name: 'id',
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateTaskDto })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Task updated successfully', 
        type: TaskResponseDto 
    })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - task not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @Req() req: RequestWithTenant,
    ): Promise<TaskResponseDto> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.taskService.updateTask(id, updateTaskDto, tenantId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Delete task', 
        description: 'Deletes a task' 
    })
    @ApiParam({
        name: 'id',
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Task deleted successfully' })
    @ApiNotFoundResponse({ description: 'Task not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - task not in same tenant' })
    async remove(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.taskService.deleteTask(id, tenantId);
    }
}