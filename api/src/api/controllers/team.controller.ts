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
import { TeamDto } from '../../application/teams/dto/team.dto';
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
@Authorize(RoleName.ADMIN, RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN)
export class TeamController {
    constructor(
        @Inject(TEAM_COMMANDS) private readonly teamCommands: ITeamCommands,
        @Inject(TEAM_QUERIES) private readonly teamQueries: ITeamQueries,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create team', description: 'Creates a new team within a tenant' })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async create(@Body() createTeamDto: CreateTeamDto): Promise<TeamDto> {
        return this.teamCommands.createTeam(createTeamDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams', description: 'Retrieves all teams or teams by tenant' })
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
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async findAll(@Query('tenantId') tenantId?: string): Promise<TeamDto[]> {
        if (tenantId) {
            return this.teamQueries.findTeamsByTenant(tenantId);
        }
        return this.teamQueries.findAllTeams();
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
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async findOne(@Param('id') id: string): Promise<TeamDto> {
        return this.teamQueries.findTeamById(id);
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
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
    ): Promise<TeamDto> {
        return this.teamCommands.updateTeam(id, updateTeamDto);
    }

    @Delete(':id')
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
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    @Authorize(RoleName.ADMIN, RoleName.TEAM_OWNER)
    async remove(@Param('id') id: string): Promise<void> {
        return this.teamCommands.deleteTeam(id);
    }
}