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
        if (!req.tenantId) {
            throw new ForbiddenException('Tenant ID is missing from request.');
        }

        return this.teamCommands.createTeam(createTeamDto, req.tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams', description: 'Retrieves all teams in the tenant' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        if (isSuperAdmin) {
            throw new ForbiddenException('Super admins must specify a tenant to retrieve teams');
        }

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is missing from request.');
        }

        return this.teamQueries.findAllTeamsByTenant(tenantId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a team by ID',
        description: 'Retrieves a specific team by its ID',
    })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team retrieved successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        return this.teamQueries.findTeamById(id, tenantId, isSuperAdmin);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a team', description: "Updates a team's details" })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiBody({ type: UpdateTeamDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team updated successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        return this.teamCommands.updateTeam(id, updateTeamDto, tenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a team', description: 'Deletes a team from the system' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        await this.teamCommands.deleteTeam(id, tenantId, isSuperAdmin);
    }

    @Post(':id/users')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Add users to a team',
        description: 'Adds one or more users to a team',
    })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiBody({ type: ManageTeamUsersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users added to team successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Team or users not found' })
    async addUsers(
        @Param('id') id: string,
        @Body() manageTeamUsersDto: ManageTeamUsersDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        return this.teamCommands.addUsersToTeam(id, manageTeamUsersDto, tenantId, isSuperAdmin);
    }

    @Delete(':id/users')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Remove users from a team',
        description: 'Removes one or more users from a team',
    })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiBody({ type: ManageTeamUsersDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users removed from team successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async removeUsers(
        @Param('id') id: string,
        @Body() manageTeamUsersDto: ManageTeamUsersDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);

        return this.teamCommands.removeUsersFromTeam(
            id,
            manageTeamUsersDto,
            tenantId,
            isSuperAdmin,
        );
    }
}
