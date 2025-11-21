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
    UseGuards,
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
} from '@nestjs/swagger';
import { GetTenantUsersQuery } from '../queries/get-tenant-users.query';
import { GetTenantUserQuery } from '../queries/get-tenant-user.query';
import { AssignRoleCommand } from '../commands/assign-role.command';
import { RemoveRoleCommand } from '../commands/remove-role.command';
import { TenantUserDto } from '../dto/tenant-user.dto';
import { AssignRoleDto, RemoveRoleDto } from '../dto/user-role.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

@ApiTags('Tenant User Management')
@ApiBearerAuth()
@Controller('tenant-admin/users')
@Authorize(RoleName.ADMIN)
export class TenantUsersController {
    constructor(
        private readonly getTenantUsersQuery: GetTenantUsersQuery,
        private readonly getTenantUserQuery: GetTenantUserQuery,
        private readonly assignRoleCommand: AssignRoleCommand,
        private readonly removeRoleCommand: RemoveRoleCommand,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Get all users in tenant',
        description: 'Retrieves all users within the requesting admin\'s tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of tenant users retrieved successfully',
        type: [TenantUserDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async findAllTenantUsers(@Req() req: RequestWithTenant): Promise<TenantUserDto[]> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to access tenant users.');
        }

        return await this.getTenantUsersQuery.execute(tenantId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get user by ID within tenant',
        description: 'Retrieves a specific user by ID within the requesting admin\'s tenant',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant user retrieved successfully',
        type: TenantUserDto,
    })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - user not in same tenant' })
    async findTenantUser(
        @Param('id') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<TenantUserDto> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to access tenant user.');
        }

        return await this.getTenantUserQuery.execute(userId, tenantId);
    }

    @Patch(':id/roles/assign')
    @ApiOperation({
        summary: 'Assign roles to user',
        description: 'Assigns specified roles to a user within the tenant',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: AssignRoleDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Roles assigned successfully',
        type: TenantUserDto,
    })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - user not in same tenant or invalid role assignment' })
    async assignRoles(
        @Param('id') userId: string,
        @Body() assignRoleDto: AssignRoleDto,
        @Req() req: RequestWithTenant,
    ): Promise<TenantUserDto> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to assign roles.');
        }

        return await this.assignRoleCommand.execute(userId, assignRoleDto, tenantId);
    }

    @Patch(':id/roles/remove')
    @ApiOperation({
        summary: 'Remove roles from user',
        description: 'Removes specified roles from a user within the tenant',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: RemoveRoleDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Roles removed successfully',
        type: TenantUserDto,
    })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - user not in same tenant or invalid role removal' })
    async removeRoles(
        @Param('id') userId: string,
        @Body() removeRoleDto: RemoveRoleDto,
        @Req() req: RequestWithTenant,
    ): Promise<TenantUserDto> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to remove roles.');
        }

        return await this.removeRoleCommand.execute(userId, removeRoleDto, tenantId);
    }
}