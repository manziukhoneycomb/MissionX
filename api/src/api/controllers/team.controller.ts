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
    Request,
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
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { UpdateTeamMemberDto } from '../../application/teams/dto/update-team-member.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { TeamMemberDto } from '../../application/teams/dto/team-member.dto';
import { TeamRoleDto } from '../../application/teams/dto/team-role.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
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

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
@Authorize(RoleName.ADMIN)
export class TeamController {
    constructor(
        @Inject(TEAM_COMMANDS) private readonly teamCommands: ITeamCommands,
        @Inject(TEAM_QUERIES) private readonly teamQueries: ITeamQueries,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create team', description: 'Creates a new team within the tenant' })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Request() req: RequestWithTenant,
    ): Promise<TeamDto> {
        createTeamDto.tenantId = req.tenantId!;
        return this.teamCommands.createTeam(createTeamDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams', description: 'Retrieves all teams for the tenant' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async findAll(@Request() req: RequestWithTenant): Promise<TeamDto[]> {
        return this.teamQueries.findTeamsByTenant(req.tenantId!);
    }

    @Get('roles')
    @ApiOperation({ summary: 'Get team roles', description: 'Retrieves all available team roles' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of team roles retrieved successfully',
        type: [TeamRoleDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getTeamRoles(): Promise<TeamRoleDto[]> {
        return this.teamQueries.findAllTeamRoles();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get team by ID',
        description: 'Retrieves a specific team by ID with members',
    })
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async findOne(@Param('id') id: string): Promise<TeamDto> {
        return this.teamQueries.findTeamByIdWithMembers(id);
    }

    @Get(':id/members')
    @ApiOperation({
        summary: 'Get team members',
        description: 'Retrieves all members of a specific team',
    })
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getMembers(@Param('id') teamId: string): Promise<TeamMemberDto[]> {
        return this.teamQueries.findTeamMembers(teamId);
    }

    @Patch(':id')
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto): Promise<TeamDto> {
        return this.teamCommands.updateTeam(id, updateTeamDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete team', description: 'Deletes a team (soft delete)' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.teamCommands.deleteTeam(id);
    }

    @Post(':id/members')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Add team member',
        description: 'Adds a user to a team with a specific role',
    })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: AddTeamMemberDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team member added successfully',
        type: TeamMemberDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async addMember(
        @Param('id') teamId: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
    ): Promise<TeamMemberDto> {
        addTeamMemberDto.teamId = teamId;
        return this.teamCommands.addTeamMember(addTeamMemberDto);
    }

    @Patch(':teamId/members/:userId')
    @ApiOperation({
        summary: 'Update team member',
        description: "Updates a team member's role or status",
    })
    @ApiParam({
        name: 'teamId',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @ApiBody({ type: UpdateTeamMemberDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team member updated successfully',
        type: TeamMemberDto,
    })
    @ApiNotFoundResponse({ description: 'Team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async updateMember(
        @Param('teamId') teamId: string,
        @Param('userId') userId: string,
        @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    ): Promise<TeamMemberDto> {
        return this.teamCommands.updateTeamMemberRole(teamId, userId, updateTeamMemberDto);
    }

    @Delete(':teamId/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove team member', description: 'Removes a user from a team' })
    @ApiParam({
        name: 'teamId',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @ApiNoContentResponse({ description: 'Team member removed successfully' })
    @ApiNotFoundResponse({ description: 'Team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async removeMember(
        @Param('teamId') teamId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        return this.teamCommands.removeTeamMember(teamId, userId);
    }
}
