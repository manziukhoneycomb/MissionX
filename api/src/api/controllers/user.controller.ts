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
} from '@nestjs/common';

import {
    IUserCommands,
    USER_COMMANDS,
} from '../../application/users/interfaces/user-commands.interface';
import {
    IUserQueries,
    USER_QUERIES,
} from '../../application/users/interfaces/user-queries.interface';
import {
    CreateUserDto,
    CreateUserBySuperAdminDto,
} from '../../application/users/dto/create-user.dto';
import { UpdateUserDto } from '../../application/users/dto/update-user.dto';
import { UserDto } from '../../application/users/dto/user.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from 'src/infrastructure/middleware/request-with-tenant.interface';
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
} from '@nestjs/swagger';

interface RequestingUserContext {
    isSuperAdmin: boolean;
    tenantId?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@Authorize()
export class UserController {
    constructor(
        @Inject(USER_COMMANDS) private readonly userCommands: IUserCommands,
        @Inject(USER_QUERIES) private readonly userQueries: IUserQueries,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    @Post('super')
    @Authorize(RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a user as super admin',
        description: 'Creates a new user with super admin privileges',
    })
    @ApiBody({ type: CreateUserBySuperAdminDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User created successfully',
        type: UserDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async createBySuperAdmin(@Body() createUserDto: CreateUserBySuperAdminDto): Promise<UserDto> {
        return this.userCommands.createUserBySuperAdmin(createUserDto);
    }

    @Post()
    @Authorize(RoleName.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a user', description: 'Creates a new user within the tenant' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User created successfully',
        type: UserDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin role or missing tenant information',
    })
    async create(
        @Body() createUserDto: CreateUserDto,
        @Req() req: RequestWithTenant,
    ): Promise<UserDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.userCommands.createUser(createUserDto, tenantId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieves all users based on role permissions',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of users retrieved successfully',
        type: [UserDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(@Req() req: RequestWithTenant): Promise<UserDto[]> {
        const { tenantId, isSuperAdmin }: RequestingUserContext =
            this._getRequestingUserContext(req);

        if (isSuperAdmin) {
            return this.userQueries.findAllUsers();
        }

        if (tenantId !== undefined) {
            return this.userQueries.findAllUsersByTenant(tenantId);
        }

        throw new ForbiddenException('User tenant information is missing.');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID', description: 'Retrieves a specific user by ID' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User retrieved successfully',
        type: UserDto,
    })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<UserDto> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.userQueries.findUserById(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user', description: 'Updates an existing user' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully', type: UserDto })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - user not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req: RequestWithTenant,
    ): Promise<UserDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.userCommands.updateUser(id, updateUserDto, tenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete user', description: 'Deletes a user' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'User deleted successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.userCommands.deleteUser(id, tenantId, isSuperAdmin);
    }

    @Patch(':id/activate')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Activate user', description: 'Activates a deactivated user' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'User activated successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async activateUser(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.userCommands.activateUser(id, tenantId, isSuperAdmin);
    }

    @Patch(':id/deactivate')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate user', description: 'Deactivates an active user' })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'User deactivated successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async deactivateUser(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.userCommands.deactivateUser(id, tenantId, isSuperAdmin);
    }
}
