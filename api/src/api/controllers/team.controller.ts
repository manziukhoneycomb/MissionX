import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
    Query,
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
import { TeamDto, TeamMemberDto, AddTeamMemberDto, UpdateTeamMemberRoleDto } from '../../application/teams/dto/team.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
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

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamController {
    constructor(
        @Inject(TEAM_COMMANDS) private readonly teamCommands: ITeamCommands,
        @Inject(TEAM_QUERIES) private readonly teamQueries: ITeamQueries,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create team', description: 'Creates a new team within a tenant' })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or higher' })
    async create(@Body() createTeamDto: CreateTeamDto): Promise<TeamDto> {
        return this.teamCommands.createTeam(createTeamDto);
    }

    @Get()
    @Authorize(RoleName.USER, RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get teams', description: 'Retrieves teams, optionally filtered by tenant' })
    @ApiQuery({
        name: 'tenantId',
        description: 'Filter teams by tenant ID',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(@Query('tenantId') tenantId?: string): Promise<TeamDto[]> {
        if (tenantId) {
            return this.teamQueries.getTeamsByTenantId(tenantId);
        }
        return this.teamQueries.getAllTeams();
    }

    @Get(':id')
    @Authorize(RoleName.USER, RoleName.ADMIN, RoleName.SUPER_ADMIN)
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
    async findOne(@Param('id') id: string): Promise<TeamDto> {
        const team = await this.teamQueries.getTeamById(id);
        if (!team) {
            throw new Error('Team not found');
        }
        return team;
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
        type: TeamDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or higher' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
    ): Promise<TeamDto> {
        return this.teamCommands.updateTeam(id, updateTeamDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete team', description: 'Deletes a team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or higher' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.teamCommands.deleteTeam(id);
    }

    @Get(':id/members')
    @Authorize(RoleName.USER, RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get team members', description: 'Retrieves all members of a team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team members retrieved successfully',
        type: [TeamMemberDto],
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getTeamMembers(@Param('id') id: string): Promise<TeamMemberDto[]> {
        return this.teamQueries.getTeamMembers(id);
    }

    @Post(':id/members')
    @HttpCode(HttpStatus.CREATED)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Add team member', description: 'Adds a user to a team with a specific role' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: AddTeamMemberDto })
    @ApiNoContentResponse({ description: 'Team member added successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or higher' })
    async addTeamMember(
        @Param('id') teamId: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
    ): Promise<void> {
        return this.teamCommands.addTeamMember(teamId, addTeamMemberDto);
    }

    @Delete(':id/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Remove team member', description: 'Removes a user from a team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @ApiNoContentResponse({ description: 'Team member removed successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or higher' })
    async removeTeamMember(
        @Param('id') teamId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        return this.teamCommands.removeTeamMember(teamId, userId);
    }

    @Patch(':id/members/:userId/role')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update team member role', description: 'Updates the role of a team member' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @ApiBody({ type: UpdateTeamMemberRoleDto })
    @ApiNoContentResponse({ description: 'Team member role updated successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or higher' })
    async updateTeamMemberRole(
        @Param('id') teamId: string,
        @Param('userId') userId: string,
        @Body() updateTeamMemberRoleDto: UpdateTeamMemberRoleDto,
    ): Promise<void> {
        return this.teamCommands.updateTeamMemberRole(teamId, userId, updateTeamMemberRoleDto);
    }

    @Get('users/:userId/teams')
    @Authorize(RoleName.USER, RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get user teams', description: 'Retrieves all teams a user belongs to' })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getUserTeams(@Param('userId') userId: string): Promise<TeamDto[]> {
        return this.teamQueries.getUserTeams(userId);
    }
}