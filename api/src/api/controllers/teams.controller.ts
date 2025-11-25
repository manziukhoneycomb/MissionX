import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { TeamsService } from '../../application/teams/teams.service';
import { CreateTeamDto } from '../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../application/teams/dto/update-team.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Get()
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Get all teams', description: 'Retrieves all teams for the tenant' })
    @ApiResponse({ status: 200, type: [TeamDto] })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        return this.teamsService.findAll(req.tenantId!);
    }

    @Get(':id')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Get team details', description: 'Retrieves a specific team' })
    @ApiResponse({ status: 200, type: TeamDto })
    async findOne(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.findById(id, req.tenantId!);
    }

    @Post()
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Create team', description: 'Creates a new team' })
    @ApiResponse({ status: 201, type: TeamDto })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.create(createTeamDto, req.tenantId!);
    }

    @Patch(':id')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Update team', description: 'Updates an existing team' })
    @ApiResponse({ status: 200, type: TeamDto })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.update(id, updateTeamDto, req.tenantId!);
    }

    @Delete(':id')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete team', description: 'Deletes a team' })
    async remove(
        @Param('id') id: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        return this.teamsService.delete(id, req.tenantId!);
    }

    @Post(':id/members')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Add member', description: 'Adds a user to the team' })
    async addMember(
        @Param('id') id: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        return this.teamsService.addMember(id, addTeamMemberDto.userId, req.tenantId!);
    }

    @Delete(':id/members/:userId')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove member', description: 'Removes a user from the team' })
    async removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        return this.teamsService.removeMember(id, userId, req.tenantId!);
    }
}
