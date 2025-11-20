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
import { TeamResponseDto, TeamMemberDto } from '../../application/teams/dto/team-response.dto';
import {
    AddTeamMemberDto,
    UpdateTeamMemberRoleDto,
} from '../../application/teams/dto/add-team-member.dto';
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
    userId: string;
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
        const tenantId: string | undefined = req.tenantId;
        const userId: string = req.userId!;

        return { isSuperAdmin, tenantId, userId };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a team',
        description: 'Creates a new team within the tenant with the requesting user as owner',
    })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User must belong to a tenant to create teams.');
        }

        return this.teamCommands.createTeam(createTeamDto, tenantId, userId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all teams',
        description: 'Retrieves all teams that the user belongs to within their tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamResponseDto[]> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamQueries.findTeamsByTenant(tenantId, userId);
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
        type: TeamResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - user not a member of this team' })
    async findOne(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamQueries.findTeamById(id, tenantId, userId);
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
        type: TeamResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient team permissions' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.updateTeam(id, updateTeamDto, tenantId, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete team',
        description: 'Deletes a team (requires team owner role)',
    })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires team owner role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.deleteTeam(id, tenantId, userId);
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
    @ApiForbiddenResponse({ description: 'Forbidden - user not a member of this team' })
    async getTeamMembers(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamMemberDto[]> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamQueries.findTeamMembers(id, tenantId, userId);
    }

    @Post(':id/members')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Add team member',
        description: 'Adds a new member to the team (requires team admin or owner role)',
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
    })
    @ApiNotFoundResponse({ description: 'Team or user not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires team admin or owner role' })
    async addMember(
        @Param('id') teamId: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.addTeamMember(teamId, addTeamMemberDto, tenantId, userId);
    }

    @Delete(':teamId/members/:memberId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove team member',
        description: 'Removes a member from the team (requires team admin or owner role)',
    })
    @ApiParam({
        name: 'teamId',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'memberId',
        description: 'Team Member ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team member removed successfully' })
    @ApiNotFoundResponse({ description: 'Team or member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires team admin or owner role' })
    async removeMember(
        @Param('teamId') teamId: string,
        @Param('memberId') memberId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.removeTeamMember(teamId, memberId, tenantId, userId);
    }

    @Patch(':teamId/members/:memberId/role')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Update team member role',
        description: 'Updates the role of a team member (requires team owner role)',
    })
    @ApiParam({
        name: 'teamId',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'memberId',
        description: 'Team Member ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateTeamMemberRoleDto })
    @ApiNoContentResponse({ description: 'Team member role updated successfully' })
    @ApiNotFoundResponse({ description: 'Team or member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires team owner role' })
    async updateMemberRole(
        @Param('teamId') teamId: string,
        @Param('memberId') memberId: string,
        @Body() updateRoleDto: UpdateTeamMemberRoleDto,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const { tenantId, userId } = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.teamCommands.updateTeamMemberRole(
            teamId,
            memberId,
            updateRoleDto,
            tenantId,
            userId,
        );
    }
}
