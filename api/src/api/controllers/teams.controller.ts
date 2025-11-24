import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TeamsService } from '../../application/teams/teams.service';
import { CreateTeamDto } from '../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../application/teams/dto/update-team.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

@ApiTags('Teams')
@Controller('teams')
@ApiBearerAuth('access-token')
@Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Post()
    @ApiOperation({ summary: 'Create team', description: 'Creates a new team' })
    @ApiResponse({ status: 201, description: 'Team created successfully', type: TeamDto })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.create(createTeamDto, req.tenantId!);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams', description: 'Retrieves all teams for the tenant' })
    @ApiResponse({ status: 200, description: 'List of teams', type: [TeamDto] })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        return this.teamsService.findAll(req.tenantId!);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get team by ID', description: 'Retrieves a specific team' })
    @ApiResponse({ status: 200, description: 'Team details', type: TeamDto })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<TeamDto> {
        return this.teamsService.findById(id, req.tenantId!);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update team', description: 'Updates an existing team' })
    @ApiResponse({ status: 200, description: 'Team updated successfully', type: TeamDto })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.update(id, updateTeamDto, req.tenantId!);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete team', description: 'Deletes a team' })
    @ApiResponse({ status: 204, description: 'Team deleted successfully' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        return this.teamsService.delete(id, req.tenantId!);
    }

    @Post(':id/members')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Add member', description: 'Adds a user to the team' })
    @ApiResponse({ status: 200, description: 'Member added successfully' })
    async addMember(
        @Param('id') id: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        return this.teamsService.addMember(id, addTeamMemberDto, req.tenantId!);
    }

    @Delete(':id/members/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove member', description: 'Removes a user from the team' })
    @ApiResponse({ status: 204, description: 'Member removed successfully' })
    async removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        return this.teamsService.removeMember(id, userId, req.tenantId!);
    }
}
