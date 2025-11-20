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
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { UpdateTeamMemberDto } from '../../application/teams/dto/update-team-member.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { TeamMemberDto } from '../../application/teams/dto/team-member.dto';
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
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamCommands.createTeam(req.tenantId!, createTeamDto);
    }

    @Get()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.USER)
    @ApiOperation({
        summary: 'Get all teams',
        description: 'Retrieves all teams within the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        return this.teamQueries.findTeamsByTenant(req.tenantId!);
    }

    @Get(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.USER)
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
        return this.teamQueries.findTeamById(id, req.tenantId!);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN)
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or team owner role' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamCommands.updateTeam(id, req.tenantId!, updateTeamDto);
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
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        return this.teamCommands.deleteTeam(id, req.tenantId!);
    }

    @Get(':id/members')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.USER)
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
    async getTeamMembers(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamMemberDto[]> {
        return this.teamQueries.findTeamMembers(id, req.tenantId!);
    }

    @Post(':id/members')
    @HttpCode(HttpStatus.CREATED)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN)
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
        type: TeamMemberDto,
    })
    @ApiNotFoundResponse({ description: 'Team or user not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or team owner role' })
    async addMember(
        @Param('id') id: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamMemberDto> {
        return this.teamCommands.addTeamMember(id, req.tenantId!, addTeamMemberDto);
    }

    @Patch(':id/members/:memberId')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN)
    @ApiOperation({ summary: 'Update team member', description: 'Updates a team member' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'memberId',
        description: 'Team Member ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateTeamMemberDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team member updated successfully',
        type: TeamMemberDto,
    })
    @ApiNotFoundResponse({ description: 'Team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or team owner role' })
    async updateMember(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Body() updateTeamMemberDto: UpdateTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamMemberDto> {
        return this.teamCommands.updateTeamMember(id, memberId, req.tenantId!, updateTeamMemberDto);
    }

    @Delete(':id/members/:memberId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN)
    @ApiOperation({ summary: 'Remove team member', description: 'Removes a user from the team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'memberId',
        description: 'Team Member ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team member removed successfully' })
    @ApiNotFoundResponse({ description: 'Team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or team owner role' })
    async removeMember(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        return this.teamCommands.removeTeamMember(id, memberId, req.tenantId!);
    }
}
