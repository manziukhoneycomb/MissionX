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
import { TeamDto } from '../../application/teams/dto/team.dto';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
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

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
@Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
export class TeamsController {
    constructor(
        @Inject(TEAM_COMMANDS) private readonly teamCommands: ITeamCommands,
        @Inject(TEAM_QUERIES) private readonly teamQueries: ITeamQueries,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a team',
        description: 'Creates a new team within the tenant',
    })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin or super admin role or missing tenant information',
    })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.teamCommands.createTeam(createTeamDto, tenantId);
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
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamQueries.findAllTeamsByTenant(tenantId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get team by ID',
        description: 'Retrieves a specific team by ID',
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
    @ApiForbiddenResponse({ description: 'Forbidden - team not in same tenant' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<TeamDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamQueries.findTeamById(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update team',
        description: 'Updates an existing team',
    })
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
    @ApiForbiddenResponse({ description: 'Forbidden - team not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.updateTeam(id, updateTeamDto, tenantId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete team',
        description: 'Deletes a team and unassigns all users',
    })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin or super admin role or team not in same tenant',
    })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.deleteTeam(id, tenantId);
    }

    @Post(':id/members')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Add member to team',
        description: 'Adds a user to a team',
    })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: AddTeamMemberDto })
    @ApiNoContentResponse({ description: 'User added to team successfully' })
    @ApiNotFoundResponse({ description: 'Team or user not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - team or user not in same tenant',
    })
    async addMember(
        @Param('id') id: string,
        @Body() addMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.addMemberToTeam(id, addMemberDto.userId, tenantId);
    }

    @Delete(':id/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove member from team',
        description: 'Removes a user from a team',
    })
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
    @ApiNoContentResponse({ description: 'User removed from team successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - team not in same tenant',
    })
    async removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.removeMemberFromTeam(id, userId, tenantId);
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
        type: TeamDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - team not in same tenant' })
    async getMembers(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<TeamDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamQueries.findTeamMembers(id, tenantId);
    }
}