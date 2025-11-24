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
import { TeamsService } from '../../application/teams/teams.service';
import { CreateTeamDto } from '../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../application/teams/dto/update-team.dto';
import { TeamDto } from '../../application/teams/dto/team.dto';
import { AddTeamMemberDto } from '../../application/teams/dto/add-team-member.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from 'src/infrastructure/middleware/request-with-tenant.interface';

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
@Authorize()
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Post()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new team' })
    @ApiBody({ type: CreateTeamDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Team created successfully',
        type: TeamDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async create(
        @Body() createTeamDto: CreateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.create(createTeamDto, req.tenantId!);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams in the tenant' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of teams retrieved successfully',
        type: [TeamDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(@Req() req: RequestWithTenant): Promise<TeamDto[]> {
        return this.teamsService.findAll(req.tenantId!);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get team by ID' })
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
        return this.teamsService.findOne(id, req.tenantId!);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update team' })
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async update(
        @Param('id') id: string,
        @Body() updateTeamDto: UpdateTeamDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.update(id, updateTeamDto, req.tenantId!);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Team deleted successfully' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        return this.teamsService.remove(id, req.tenantId!);
    }

    @Post(':id/members')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Add member to team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: AddTeamMemberDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Member added successfully',
        type: TeamDto,
    })
    @ApiNotFoundResponse({ description: 'Team or user not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async addMember(
        @Param('id') id: string,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.addMember(id, addTeamMemberDto.userId, req.tenantId!);
    }

    @Delete(':id/members/:userId')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove member from team' })
    @ApiParam({
        name: 'id',
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Member removed successfully',
        type: TeamDto,
    })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Req() req: RequestWithTenant,
    ): Promise<TeamDto> {
        return this.teamsService.removeMember(id, userId, req.tenantId!);
    }
}