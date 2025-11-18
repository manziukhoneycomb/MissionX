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
import { InvitationAcceptanceService } from '../../application/users/services/invitation-acceptance.service';
import {
    CreateUserDto,
    CreateUserBySuperAdminDto,
} from '../../application/users/dto/create-user.dto';
import { UpdateUserDto } from '../../application/users/dto/update-user.dto';
import { UserDto } from '../../application/users/dto/user.dto';
import { InviteUserDto, InviteUserResponseDto } from '../../application/users/dto/invite-user.dto';
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
        private readonly invitationAcceptanceService: InvitationAcceptanceService,
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

    @Post('process-invitation')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Process invitation acceptance',
        description: 'Processes a user who has accepted an invitation and creates local user record if needed',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                clerkUserId: { type: 'string', description: 'Clerk user ID' },
                email: { type: 'string', description: 'User email address' },
            },
            required: ['clerkUserId', 'email'],
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invitation processed successfully',
        type: UserDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async processInvitation(
        @Body() body: { clerkUserId: string; email: string },
    ): Promise<UserDto | null> {
        return this.invitationAcceptanceService.handleInvitationAcceptance(
            body.clerkUserId,
            body.email,
        );
    }
}

@ApiTags('Tenant User Management')
@ApiBearerAuth()
@Controller('tenants/:tenantId/users')
@Authorize(RoleName.ADMIN)
export class TenantUserController {
    constructor(
        @Inject(USER_COMMANDS) private readonly userCommands: IUserCommands,
        @Inject(USER_QUERIES) private readonly userQueries: IUserQueries,
    ) {}

    private _validateTenantAccess(req: RequestWithTenant, tenantId: string): void {
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        
        if (!isSuperAdmin && req.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to different tenant.');
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Get users in tenant',
        description: 'Retrieves all users belonging to the specified tenant',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of tenant users retrieved successfully',
        type: [UserDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async getTenantUsers(
        @Param('tenantId') tenantId: string,
        @Req() req: RequestWithTenant,
    ): Promise<UserDto[]> {
        this._validateTenantAccess(req, tenantId);
        return this.userQueries.findAllUsersByTenant(tenantId);
    }

    @Delete(':userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove user from tenant',
        description: 'Removes a user from the specified tenant',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'User removed successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async removeUserFromTenant(
        @Param('tenantId') tenantId: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        this._validateTenantAccess(req, tenantId);
        
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        return this.userCommands.deleteUser(userId, tenantId, isSuperAdmin);
    }

    @Patch(':userId/role')
    @ApiOperation({
        summary: 'Update user role in tenant',
        description: 'Updates the role of a user within the specified tenant',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                roleIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of role IDs to assign to the user',
                },
            },
            required: ['roleIds'],
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User role updated successfully',
        type: UserDto,
    })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async updateUserRole(
        @Param('tenantId') tenantId: string,
        @Param('userId') userId: string,
        @Body() roleUpdateDto: { roleIds: string[] },
        @Req() req: RequestWithTenant,
    ): Promise<UserDto> {
        this._validateTenantAccess(req, tenantId);
        
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const updateDto = new UpdateUserDto();
        updateDto.roleIds = roleUpdateDto.roleIds;
        
        return this.userCommands.updateUser(userId, updateDto, tenantId, isSuperAdmin);
    }

    @Post('invite')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Invite user to tenant',
        description: 'Sends an invitation email to a user to join the specified tenant',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: InviteUserDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Invitation sent successfully',
        type: InviteUserResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async inviteUser(
        @Param('tenantId') tenantId: string,
        @Body() inviteDto: InviteUserDto,
        @Req() req: RequestWithTenant,
    ): Promise<InviteUserResponseDto> {
        this._validateTenantAccess(req, tenantId);
        return this.userCommands.inviteUserToTenant(inviteDto, tenantId);
    }

    @Get('invitations')
    @ApiOperation({
        summary: 'Get tenant invitations',
        description: 'Retrieves all pending invitations for the specified tenant',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invitations retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Invitation ID' },
                    email: { type: 'string', description: 'Invited user email' },
                    status: { type: 'string', enum: ['pending', 'accepted', 'revoked'] },
                    tenantId: { type: 'string', description: 'Tenant ID' },
                    roles: { type: 'array', items: { type: 'string' }, description: 'Assigned roles' },
                    createdAt: { type: 'string', format: 'date-time', description: 'Creation date' },
                },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async getTenantInvitations(
        @Param('tenantId') tenantId: string,
        @Req() req: RequestWithTenant,
    ) {
        this._validateTenantAccess(req, tenantId);
        return this.userQueries.findTenantInvitations(tenantId);
    }

    @Delete('invitations/:invitationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Revoke invitation',
        description: 'Revokes a pending invitation',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'invitationId',
        description: 'Invitation ID',
        example: 'inv_1234567890',
    })
    @ApiNoContentResponse({ description: 'Invitation revoked successfully' })
    @ApiNotFoundResponse({ description: 'Invitation not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async revokeInvitation(
        @Param('tenantId') tenantId: string,
        @Param('invitationId') invitationId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        this._validateTenantAccess(req, tenantId);
        
        const invitation = await this.userQueries.findInvitationById(invitationId);
        if (!invitation || invitation.tenantId !== tenantId) {
            throw new ForbiddenException('Invitation not found or does not belong to tenant.');
        }
        
        return this.userCommands.revokeInvitation(invitationId);
    }
}
