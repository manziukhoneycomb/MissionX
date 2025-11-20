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
    Req,
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
import { TeamResponseDto } from '../../application/teams/dto/team-response.dto';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { CreateTeamRoleDto } from '../../application/teams/dto/create-team-role.dto';
import { UpdateTeamRoleDto } from '../../application/teams/dto/update-team-role.dto';
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
export class TeamController {
    constructor(
        @Inject(TEAM_COMMANDS) private readonly teamCommands: ITeamCommands,
        @Inject(TEAM_QUERIES) private readonly teamQueries: ITeamQueries,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create team', description: 'Creates a new team within the current tenant' })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        createTeamDto.tenantId = req.tenantId!;
        return this.teamCommands.createTeam(createTeamDto);
    }

    @Get()
    @Authorize()
    @ApiOperation({ summary: 'Get all teams', description: 'Retrieves all teams for the current tenant' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamResponseDto[]> {
        return this.teamQueries.findAllTeams(req.tenantId!);
    }

    @Get(':id')
    @Authorize()
    @ApiOperation({ summary: 'Get team by ID', description: 'Retrieves a specific team by ID' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team retrieved successfully',
        type: TeamResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findOne(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        return this.teamQueries.findTeamById(id, req.tenantId!);
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
        type: TeamResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        return this.teamCommands.updateTeam(id, updateTeamDto, req.tenantId!);
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async remove(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        return this.teamCommands.deleteTeam(id, req.tenantId!);
    }

    @Post(':id/members')
    @HttpCode(HttpStatus.CREATED)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Add team member', description: 'Adds a user to the team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: AddTeamMemberDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team member added successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async addMember(
        @Param('id') teamId: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
    ): Promise<void> {
        addTeamMemberDto.teamId = teamId;
        return this.teamCommands.addTeamMember(addTeamMemberDto);
    }

    @Delete(':id/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Remove team member', description: 'Removes a user from the team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team member removed successfully' })
    @ApiNotFoundResponse({ description: 'Team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async removeMember(
        @Param('id') teamId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        return this.teamCommands.removeTeamMember(teamId, userId);
    }

    @Get(':id/members')
    @Authorize()
    @ApiOperation({ summary: 'Get team members', description: 'Retrieves all members of a team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team members retrieved successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getMembers(@Param('id') teamId: string): Promise<any[]> {
        return this.teamQueries.findTeamMembers(teamId);
    }

    @Post(':id/roles')
    @HttpCode(HttpStatus.CREATED)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create team role', description: 'Creates a new role for the team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: CreateTeamRoleDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team role created successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async createRole(
        @Param('id') teamId: string,
        @Body() createTeamRoleDto: CreateTeamRoleDto,
    ): Promise<any> {
        createTeamRoleDto.teamId = teamId;
        return this.teamCommands.createTeamRole(createTeamRoleDto);
    }

    @Get(':id/roles')
    @Authorize()
    @ApiOperation({ summary: 'Get team roles', description: 'Retrieves all roles for a team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team roles retrieved successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getRoles(@Param('id') teamId: string): Promise<any[]> {
        return this.teamQueries.findTeamRoles(teamId);
    }

    @Patch('roles/:roleId')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update team role', description: 'Updates a team role' })
    @ApiParam({
        name: 'roleId',
        description: 'Team Role ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateTeamRoleDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team role updated successfully',
    })
    @ApiNotFoundResponse({ description: 'Team role not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async updateRole(
        @Param('roleId') roleId: string,
        @Body() updateTeamRoleDto: UpdateTeamRoleDto,
    ): Promise<any> {
        return this.teamCommands.updateTeamRole(roleId, updateTeamRoleDto);
    }

    @Delete('roles/:roleId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete team role', description: 'Deletes a team role' })
    @ApiParam({
        name: 'roleId',
        description: 'Team Role ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team role deleted successfully' })
    @ApiNotFoundResponse({ description: 'Team role not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async deleteRole(@Param('roleId') roleId: string): Promise<void> {
        return this.teamCommands.deleteTeamRole(roleId);
    }
}