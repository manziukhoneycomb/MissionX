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
import {
    ITeamCommands,
    TEAM_COMMANDS,
} from '../../application/teams/interfaces/team-commands.interface';
import {
    ITeamQueries,
    TEAM_QUERIES,
} from '../../application/teams/interfaces/team-queries.interface';
import { CreateTeamDto } from '../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../application/teams/dto/update-team.dto';
import { ManageTeamUsersDto } from '../../application/teams/dto/manage-team-users.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from 'src/infrastructure/middleware/request-with-tenant.interface';

interface RequestingUserContext {
    isSuperAdmin: boolean;
    tenantId?: string;
}

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
@Authorize()
export class TeamController {
    constructor(
        @Inject(TEAM_COMMANDS) private readonly teamCommands: ITeamCommands,
        @Inject(TEAM_QUERIES) private readonly teamQueries: ITeamQueries,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    @Post()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a team', description: 'Creates a new team within the tenant' })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin role or missing tenant information',
    })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);
        
        const effectiveTenantId = isSuperAdmin && req.tenantId 
            ? req.tenantId 
            : tenantId;

        if (!effectiveTenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        return this.teamCommands.create(createTeamDto, effectiveTenantId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all teams',
        description: 'Retrieves all teams for the current tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        const { tenantId, isSuperAdmin }: RequestingUserContext =
            this._getRequestingUserContext(req);

        if (!isSuperAdmin && !tenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        const effectiveTenantId = isSuperAdmin && req.tenantId 
            ? req.tenantId 
            : tenantId;

        if (!effectiveTenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        return this.teamQueries.findAllByTenant(effectiveTenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get team by ID', description: 'Retrieves a specific team by ID' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team retrieved successfully',
        type: TeamDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<TeamDto> {
        const { tenantId, isSuperAdmin }: RequestingUserContext = 
            this._getRequestingUserContext(req);

        const effectiveTenantId = isSuperAdmin && req.tenantId 
            ? req.tenantId 
            : tenantId;

        if (!isSuperAdmin && !effectiveTenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        return this.teamQueries.findById(id, effectiveTenantId!, isSuperAdmin);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update team', description: 'Updates an existing team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateTeamDto })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Team updated successfully', 
        type: TeamDto 
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - team not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        const effectiveTenantId = isSuperAdmin && req.tenantId 
            ? req.tenantId 
            : tenantId;

        if (!effectiveTenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        return this.teamCommands.update(id, updateTeamDto, effectiveTenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete team', description: 'Deletes a team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        const effectiveTenantId = isSuperAdmin && req.tenantId 
            ? req.tenantId 
            : tenantId;

        if (!effectiveTenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        return this.teamCommands.delete(id, effectiveTenantId, isSuperAdmin);
    }

    @Post(':id/users')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Add users to team', 
        description: 'Adds multiple users to a team' 
    })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: ManageTeamUsersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users added to team successfully',
        type: TeamDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async addUsers(
        @Param('id') id: string,
        @Body() manageUsersDto: ManageTeamUsersDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        const effectiveTenantId = isSuperAdmin && req.tenantId 
            ? req.tenantId 
            : tenantId;

        if (!effectiveTenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        return this.teamCommands.addUsersToTeam(
            id, 
            manageUsersDto.userIds, 
            effectiveTenantId, 
            isSuperAdmin
        );
    }

    @Delete(':id/users')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Remove users from team', 
        description: 'Removes multiple users from a team' 
    })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: ManageTeamUsersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users removed from team successfully',
        type: TeamDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async removeUsers(
        @Param('id') id: string,
        @Body() manageUsersDto: ManageTeamUsersDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        const effectiveTenantId = isSuperAdmin && req.tenantId 
            ? req.tenantId 
            : tenantId;

        if (!effectiveTenantId) {
            throw new ForbiddenException('Tenant information is missing.');
        }

        return this.teamCommands.removeUsersFromTeam(
            id, 
            manageUsersDto.userIds, 
            effectiveTenantId, 
            isSuperAdmin
        );
    }
}