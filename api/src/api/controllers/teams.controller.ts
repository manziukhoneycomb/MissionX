import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Inject,
    Req,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { ITeamService, TEAM_SERVICE } from '../../application/teams/interfaces/team.service.interface';
import { CreateTeamDto } from '../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../application/teams/dto/update-team.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('teams')
@Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
export class TeamsController {
    constructor(@Inject(TEAM_SERVICE) private readonly teamsService: ITeamService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new team' })
    @ApiResponse({ status: 201, description: 'The team has been successfully created.', type: TeamDto })
    create(@Body() createTeamDto: CreateTeamDto, @Req() req: RequestWithTenant): Promise<TeamDto> {
        return this.teamsService.create(req.tenantId!, createTeamDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams for the tenant' })
    @ApiResponse({ status: 200, description: 'List of teams.', type: [TeamDto] })
    findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        return this.teamsService.findAllByTenantId(req.tenantId!);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a team by ID' })
    @ApiResponse({ status: 200, description: 'The team details.', type: TeamDto })
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.findById(id, req.tenantId!);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a team' })
    @ApiResponse({ status: 200, description: 'The team has been successfully updated.', type: TeamDto })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.update(id, req.tenantId!, updateTeamDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a team' })
    @ApiResponse({ status: 204, description: 'The team has been successfully deleted.' })
    remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithTenant): Promise<void> {
        return this.teamsService.delete(id, req.tenantId!);
    }

    @Post(':id/members')
    @ApiOperation({ summary: 'Add a member to a team' })
    @ApiResponse({ status: 200, description: 'The member has been added.', type: TeamDto })
    addMember(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.addMember(id, addTeamMemberDto.userId, req.tenantId!);
    }

    @Delete(':id/members/:userId')
    @ApiOperation({ summary: 'Remove a member from a team' })
    @ApiResponse({ status: 200, description: 'The member has been removed.', type: TeamDto })
    removeMember(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.removeMember(id, userId, req.tenantId!);
    }
}
