import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamResponseDto, TeamMemberDto } from './dto/team-response.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    private mapTeamToDto(team: Team): TeamResponseDto {
        const dto = new TeamResponseDto();

        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.tenant) {
            dto.tenant = {
                id: team.tenant.id,
                name: team.tenant.name,
            };
        }

        if (team.teamMembers) {
            dto.teamMembers = team.teamMembers.map((member) => this.mapTeamMemberToDto(member));
        }

        return dto;
    }

    private mapTeamMemberToDto(teamMember: TeamMember): TeamMemberDto {
        const dto = new TeamMemberDto();

        dto.id = teamMember.id;
        dto.userId = teamMember.userId;
        dto.role = teamMember.role;
        dto.joinedAt = teamMember.joinedAt;

        if (teamMember.user) {
            dto.user = {
                id: teamMember.user.id,
                email: teamMember.user.email,
                firstName: teamMember.user.firstName,
                lastName: teamMember.user.lastName,
            };
        }

        return dto;
    }

    private async validateUserTeamAccess(
        teamId: string,
        tenantId: string,
        requestingUserId: string,
    ): Promise<{ team: Team; member: TeamMember }> {
        const team = await this.teamRepository.findByIdAndTenant(teamId, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const member = await this.teamRepository.findTeamMember(teamId, requestingUserId);

        if (!member) {
            throw new ForbiddenException('You do not have access to this team');
        }

        return { team, member };
    }

    async findTeamById(
        id: string,
        tenantId: string,
        requestingUserId: string,
    ): Promise<TeamResponseDto> {
        const { team } = await this.validateUserTeamAccess(id, tenantId, requestingUserId);
        return this.mapTeamToDto(team);
    }

    async findTeamsByTenant(
        tenantId: string,
        requestingUserId: string,
    ): Promise<TeamResponseDto[]> {
        const userTeams = await this.teamRepository.findByUser(requestingUserId);

        const tenantsTeams = userTeams.filter((team) => team.tenantId === tenantId);

        return tenantsTeams.map((team) => this.mapTeamToDto(team));
    }

    async findTeamMembers(
        teamId: string,
        tenantId: string,
        requestingUserId: string,
    ): Promise<TeamMemberDto[]> {
        await this.validateUserTeamAccess(teamId, tenantId, requestingUserId);

        const members = await this.teamRepository.findTeamMembers(teamId);
        return members.map((member) => this.mapTeamMemberToDto(member));
    }

    async findTeamsByUser(userId: string, tenantId: string): Promise<TeamResponseDto[]> {
        const teams = await this.teamRepository.findByUser(userId);

        const tenantTeams = teams.filter((team) => team.tenantId === tenantId);

        return tenantTeams.map((team) => this.mapTeamToDto(team));
    }
}
