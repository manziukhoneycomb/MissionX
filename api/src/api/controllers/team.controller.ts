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
import {
    CreateTeamDto,
    CreateTeamBySuperAdminDto,
} from '../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../application/teams/dto/update-team.dto';
import { ManageTeamUsersDto } from '../../application/teams/dto/manage-team-users.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { UserDto } from '../../application/users/dto/user.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

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

    @Post('super')
    @Authorize(RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a team as super admin',
        description: 'Creates a new team with super admin privileges',
    })
    @ApiBody({ type: CreateTeamBySuperAdminDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async createBySuperAdmin(@Body() createTeamDto: CreateTeamBySuperAdminDto): Promise<TeamDto> {
        return this.teamCommands.createTeamBySuperAdmin(createTeamDto);
    }

    @Post()
    @Authorize(RoleName.ADMIN)
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
    async create(@Body() createTeamDto: CreateTeamDto, @Req() req: RequestWithTenant): Promise<TeamDto> {
        if (!req.tenantId) {
            throw new Error('Tenant information is missing');
        }
        return this.teamCommands.createTeam(createTeamDto, req.tenantId);
    }

    @Get()
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Get all teams',
        description: 'Retrieves all teams within the tenant or all teams for super admin',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);
        
        if (isSuperAdmin) {
            return this.teamQueries.findAllTeams();
        }
        
        if (!tenantId) {
            throw new Error('Tenant information is missing');
        }
        
        return this.teamQueries.findAllTeamsByTenant(tenantId);
    }

    @Get(':id')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({ summary: 'Get a team by ID', description: 'Retrieves a specific team by its ID' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team retrieved successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<TeamDto> {
        const { tenantId } = this._getRequestingUserContext(req);
        return this.teamQueries.findTeamById(id, tenantId);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({ summary: 'Update a team', description: 'Updates a team by its ID' })
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
        @Req() req: RequestWithTenant
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);
        return this.teamCommands.updateTeam(id, updateTeamDto, tenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a team', description: 'Deletes a team by its ID' })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);
        await this.teamCommands.deleteTeam(id, tenantId, isSuperAdmin);
    }

    @Get(':id/users')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Get team users',
        description: 'Retrieves all users belonging to a specific team',
    })
    @ApiParam({ name: 'id', description: 'Team ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team users retrieved successfully',
        type: [UserDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async getTeamUsers(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<UserDto[]> {
        const { tenantId } = this._getRequestingUserContext(req);
        return this.teamQueries.getTeamUsers(id, tenantId);
    }

    @Post(':id/users')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Add users to team',
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
    @ApiNotFoundResponse({ description: 'Team not found' })
    async addUsersToTeam(
        @Param('id') id: string,
        @Body() manageUsersDto: ManageTeamUsersDto,
        @Req() req: RequestWithTenant
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);
        return this.teamCommands.addUsersToTeam(id, manageUsersDto, tenantId, isSuperAdmin);
    }

    @Delete(':id/users')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({
        summary: 'Remove users from team',
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
    async removeUsersFromTeam(
        @Param('id') id: string,
        @Body() manageUsersDto: ManageTeamUsersDto,
        @Req() req: RequestWithTenant
    ): Promise<TeamDto> {
        const { isSuperAdmin, tenantId } = this._getRequestingUserContext(req);
        return this.teamCommands.removeUsersFromTeam(id, manageUsersDto, tenantId, isSuperAdmin);
    }
}