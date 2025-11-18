import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import {
    ITeamCommands,
    TEAM_COMMANDS,
} from '../../application/teams/interfaces/team-commands.interface';
import {
    ITeamQueries,
    TEAM_QUERIES,
} from '../../application/teams/interfaces/team-queries.interface';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { TeamMemberDto } from '../../application/teams/dto/team-member.dto';
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
} from '@nestjs/swagger';

@ApiTags('Team Members')
@ApiBearerAuth()
@Controller('teams/:teamId/members')
@Authorize(RoleName.ADMIN, RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN)
export class TeamMemberController {
    constructor(
        @Inject(TEAM_COMMANDS) private readonly teamCommands: ITeamCommands,
        @Inject(TEAM_QUERIES) private readonly teamQueries: ITeamQueries,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Add team member',
        description: 'Adds a user to a team with specified role',
    })
    @ApiParam({
        name: 'teamId',
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
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    @Authorize(RoleName.ADMIN, RoleName.TEAM_OWNER)
    async addMember(
        @Param('teamId') teamId: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
    ): Promise<TeamMemberDto> {
        return this.teamCommands.addTeamMember(teamId, addTeamMemberDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get team members',
        description: 'Retrieves all members of a specific team',
    })
    @ApiParam({
        name: 'teamId',
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
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async findMembers(@Param('teamId') teamId: string): Promise<TeamMemberDto[]> {
        return this.teamQueries.findTeamMembers(teamId);
    }

    @Get(':userId')
    @ApiOperation({
        summary: 'Get team member',
        description: 'Retrieves information about a specific team member',
    })
    @ApiParam({
        name: 'teamId',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Team member retrieved successfully',
        type: TeamMemberDto,
    })
    @ApiNotFoundResponse({ description: 'Team or team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async findMember(
        @Param('teamId') teamId: string,
        @Param('userId') userId: string,
    ): Promise<TeamMemberDto> {
        return this.teamQueries.findTeamMember(teamId, userId);
    }

    @Delete(':userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove team member',
        description: 'Removes a user from a team',
    })
    @ApiParam({
        name: 'teamId',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team member removed successfully' })
    @ApiNotFoundResponse({ description: 'Team or team member not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    @Authorize(RoleName.ADMIN, RoleName.TEAM_OWNER)
    async removeMember(
        @Param('teamId') teamId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        return this.teamCommands.removeTeamMember(teamId, userId);
    }
}