import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Put,
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
    IRoleRepository,
    ROLE_REPOSITORY,
} from '../../application/repositories/role.repository.interface';
import {
    CreateUserDto,
    CreateUserBySuperAdminDto,
} from '../../application/users/dto/create-user.dto';
import { UpdateUserDto } from '../../application/users/dto/update-user.dto';
import { UserDto } from '../../application/users/dto/user.dto';
import { InviteUserDto, InvitationResponseDto } from '../../application/users/dto/invite-user.dto';
import { ClerkInviteService } from '../../application/users/services/clerk-invite.service';
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
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
        private readonly clerkInviteService: ClerkInviteService,
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

    @Get('tenants/:tenantId/users')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Get users by tenant',
        description: 'Retrieves all users within a specific tenant (Admin only)',
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role and matching tenant' })
    async findUsersByTenant(
        @Param('tenantId') tenantId: string,
        @Req() req: RequestWithTenant,
    ): Promise<UserDto[]> {
        const requestingUserTenantId = req.tenantId;
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);

        if (!isSuperAdmin && requestingUserTenantId !== tenantId) {
            throw new ForbiddenException('Access denied to users from different tenant.');
        }

        return this.userQueries.findAllUsersByTenant(tenantId);
    }

    @Delete('tenants/:tenantId/users/:userId')
    @Authorize(RoleName.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove user from tenant',
        description: 'Removes a user from a specific tenant (Admin only)',
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
    @ApiNoContentResponse({ description: 'User removed from tenant successfully' })
    @ApiNotFoundResponse({ description: 'User or tenant not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role and matching tenant' })
    async removeUserFromTenant(
        @Param('tenantId') tenantId: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const requestingUserTenantId = req.tenantId;
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);

        if (!isSuperAdmin && requestingUserTenantId !== tenantId) {
            throw new ForbiddenException('Access denied to users from different tenant.');
        }

        return this.userCommands.deleteUser(userId, tenantId, isSuperAdmin);
    }

    @Put('tenants/:tenantId/users/:userId/role')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Update user role within tenant',
        description: 'Updates a user role within a specific tenant (Admin only)',
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
                roleId: {
                    type: 'string',
                    description: 'Role ID to assign',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
            },
            required: ['roleId'],
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User role updated successfully',
        type: UserDto,
    })
    @ApiNotFoundResponse({ description: 'User, tenant, or role not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role and matching tenant' })
    async updateUserRoleInTenant(
        @Param('tenantId') tenantId: string,
        @Param('userId') userId: string,
        @Body() body: { roleId: string },
        @Req() req: RequestWithTenant,
    ): Promise<UserDto> {
        const requestingUserTenantId = req.tenantId;
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);

        if (!isSuperAdmin && requestingUserTenantId !== tenantId) {
            throw new ForbiddenException('Access denied to users from different tenant.');
        }

        return this.userCommands.updateUserRole(userId, body.roleId, tenantId, isSuperAdmin);
    }

    @Post('tenants/:tenantId/invites')
    @Authorize(RoleName.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Invite user to tenant',
        description: 'Sends an invitation to a user to join a specific tenant with assigned roles',
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
        type: InvitationResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role and matching tenant' })
    async inviteUserToTenant(
        @Param('tenantId') tenantId: string,
        @Body() inviteDto: InviteUserDto,
        @Req() req: RequestWithTenant,
    ): Promise<InvitationResponseDto> {
        const requestingUserTenantId = req.tenantId;
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);

        if (!isSuperAdmin && requestingUserTenantId !== tenantId) {
            throw new ForbiddenException('Access denied to invite users to different tenant.');
        }

        const roles = await this.roleRepository.findByIds(inviteDto.roleIds);
        if (roles.length !== inviteDto.roleIds.length) {
            throw new ForbiddenException('One or more specified role IDs are invalid.');
        }

        const roleNames = roles.map((r) => r.name);

        if (!isSuperAdmin && roleNames.includes(RoleName.SUPER_ADMIN)) {
            throw new ForbiddenException('Cannot invite users with Super Admin role.');
        }

        return this.clerkInviteService.createInvitation(inviteDto, tenantId, roleNames);
    }

    @Get('tenants/:tenantId/invites')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Get tenant invitations',
        description: 'Retrieves all pending invitations for a specific tenant',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of invitations retrieved successfully',
        type: [InvitationResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role and matching tenant' })
    async getTenantInvitations(
        @Param('tenantId') tenantId: string,
        @Req() req: RequestWithTenant,
    ): Promise<InvitationResponseDto[]> {
        const requestingUserTenantId = req.tenantId;
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);

        if (!isSuperAdmin && requestingUserTenantId !== tenantId) {
            throw new ForbiddenException('Access denied to invitations from different tenant.');
        }

        return this.clerkInviteService.getInvitationsForTenant(tenantId);
    }

    @Get('invites/:invitationId')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Get invitation by ID',
        description: 'Retrieves a specific invitation by its ID',
    })
    @ApiParam({
        name: 'invitationId',
        description: 'Invitation ID',
        example: 'inv_123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invitation retrieved successfully',
        type: InvitationResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Invitation not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getInvitation(@Param('invitationId') invitationId: string): Promise<InvitationResponseDto> {
        const invitation = await this.clerkInviteService.getInvitation(invitationId);
        if (!invitation) {
            throw new ForbiddenException('Invitation not found');
        }
        return invitation;
    }

    @Delete('invites/:invitationId')
    @Authorize(RoleName.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Revoke invitation',
        description: 'Revokes/cancels a pending invitation',
    })
    @ApiParam({
        name: 'invitationId',
        description: 'Invitation ID',
        example: 'inv_123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Invitation revoked successfully' })
    @ApiNotFoundResponse({ description: 'Invitation not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role and matching tenant' })
    async revokeInvitation(
        @Param('invitationId') invitationId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const invitation = await this.clerkInviteService.getInvitation(invitationId);
        if (!invitation) {
            throw new ForbiddenException('Invitation not found');
        }

        const requestingUserTenantId = req.tenantId;
        const isSuperAdmin = req.userRoles!.includes(RoleName.SUPER_ADMIN);

        if (!isSuperAdmin && requestingUserTenantId !== invitation.tenantId) {
            throw new ForbiddenException('Access denied to revoke invitations from different tenant.');
        }

        return this.clerkInviteService.revokeInvitation(invitationId);
    }

    @Get('invites/check/:email')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Check invitation status by email',
        description: 'Retrieves invitation status for a specific email address',
    })
    @ApiParam({
        name: 'email',
        description: 'Email address to check',
        example: 'user@example.com',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invitation status retrieved successfully',
        type: InvitationResponseDto,
    })
    @ApiNotFoundResponse({ description: 'No pending invitation found for this email' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async checkInvitationByEmail(@Param('email') email: string): Promise<InvitationResponseDto> {
        const invitation = await this.clerkInviteService.getInvitationByEmail(email);
        if (!invitation) {
            throw new ForbiddenException('No pending invitation found for this email');
        }
        return invitation;
    }

    @Get('invites/all')
    @Authorize(RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get all invitations (Super Admin only)',
        description: 'Retrieves all pending invitations across all tenants',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'All invitations retrieved successfully',
        type: [InvitationResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async getAllInvitations(): Promise<InvitationResponseDto[]> {
        return this.clerkInviteService.getAllInvitations();
    }
}
