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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from '../../application/teams/teams.service';
import { CreateTeamDto } from '../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../application/teams/dto/update-team.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Post()
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Create a new team' })
    @ApiResponse({ status: HttpStatus.CREATED, type: TeamDto })
    create(@Body() createTeamDto: CreateTeamDto, @Req() req: RequestWithTenant) {
        return this.teamsService.create(createTeamDto, req.tenantId!);
    }

    @Get()
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Get all teams for the tenant' })
    @ApiResponse({ status: HttpStatus.OK, type: [TeamDto] })
    findAll(@Req() req: RequestWithTenant) {
        return this.teamsService.findAll(req.tenantId!);
    }

    @Get(':id')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Get a team by id' })
    @ApiResponse({ status: HttpStatus.OK, type: TeamDto })
    findOne(@Param('id') id: string, @Req() req: RequestWithTenant) {
        return this.teamsService.findOne(id, req.tenantId!);
    }

    @Patch(':id')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Update a team' })
    @ApiResponse({ status: HttpStatus.OK, type: TeamDto })
    update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ) {
        return this.teamsService.update(id, updateTeamDto, req.tenantId!);
    }

    @Delete(':id')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a team' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT })
    remove(@Param('id') id: string, @Req() req: RequestWithTenant) {
        return this.teamsService.remove(id, req.tenantId!);
    }

    @Post(':id/members')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @ApiOperation({ summary: 'Add a member to the team' })
    @ApiResponse({ status: HttpStatus.OK })
    addMember(
        @Param('id') id: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ) {
        return this.teamsService.addMember(id, addTeamMemberDto.userId, req.tenantId!);
    }

    @Delete(':id/members/:userId')
    @Authorize(RoleName.SUPER_ADMIN, RoleName.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove a member from the team' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT })
    removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ) {
        return this.teamsService.removeMember(id, userId, req.tenantId!);
    }
}
