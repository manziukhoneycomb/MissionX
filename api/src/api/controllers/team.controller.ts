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
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import {
    TeamResponseDto,
    TeamMemberResponseDto,
} from '../../application/teams/dto/team-response.dto';
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

    @Post()
    @Authorize(RoleName.ADMIN, RoleName.TEAM_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new team',
        description: 'Creates a new team within the tenant',
    })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin or team admin role',
    })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('User must belong to a tenant.');
        }

        return this.teamCommands.createTeam(createTeamDto, tenantId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all teams',
        description: 'Retrieves all teams based on role permissions',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamResponseDto[]> {
        const { tenantId, isSuperAdmin }: RequestingUserContext =
            this._getRequestingUserContext(req);

        if (isSuperAdmin) {
            return this.teamQueries.findAllTeams();
        }

        if (tenantId !== undefined) {
            return this.teamQueries.findTeamsByTenant(tenantId);
        }

        throw new ForbiddenException('User tenant information is missing.');
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
        type: TeamResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findOne(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.teamQueries.findTeamById(id, tenantId);
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
        type: [TeamMemberResponseDto],
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findTeamMembers(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamMemberResponseDto[]> {
        const { tenantId, isSuperAdmin }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.teamQueries.findTeamMembers(id, tenantId, isSuperAdmin);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN, RoleName.TEAM_ADMIN)
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
    @ApiForbiddenResponse({ description: 'Forbidden - team not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamResponseDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.teamCommands.updateTeam(id, updateTeamDto, tenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.TEAM_ADMIN)
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or team admin role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.teamCommands.deleteTeam(id, tenantId, isSuperAdmin);
    }

    @Post(':id/members')
    @Authorize(RoleName.ADMIN, RoleName.TEAM_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Add team member',
        description: 'Adds a new member to the team',
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
        type: TeamMemberResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Team or user not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or team admin role' })
    async addMember(
        @Param('id') teamId: string,
        @Body() addMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamMemberResponseDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.teamCommands.addTeamMember(teamId, addMemberDto, tenantId, isSuperAdmin);
    }

    @Delete(':teamId/members/:userId')
    @Authorize(RoleName.ADMIN, RoleName.TEAM_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove team member',
        description: 'Removes a member from the team',
    })
    @ApiParam({
        name: 'teamId',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '456e7890-a12b-34c5-d678-901234567890',
    })
    @ApiNoContentResponse({ description: 'Team member removed successfully' })
    @ApiNotFoundResponse({ description: 'Team or team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or team admin role' })
    async removeMember(
        @Param('teamId') teamId: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.teamCommands.removeTeamMember(teamId, userId, tenantId, isSuperAdmin);
    }
}
