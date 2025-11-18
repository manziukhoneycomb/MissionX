import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamRoleRepository, TEAM_ROLE_REPOSITORY } from '../repositories/team-role.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamRole } from '../../domain/entities/team-role.entity';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { TeamMemberDto } from './dto/team-member.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TEAM_ROLE_REPOSITORY)
        private readonly teamRoleRepository: ITeamRoleRepository,
    ) {}

    private mapToDto(team: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;
        return dto;
    }

    private mapTeamRoleToMemberDto(teamRole: TeamRole): TeamMemberDto {
        const dto = new TeamMemberDto();
        dto.id = teamRole.id;
        dto.teamId = teamRole.teamId;
        dto.userId = teamRole.userId;
        dto.role = teamRole.role;
        dto.createdAt = teamRole.createdAt;
        dto.updatedAt = teamRole.updatedAt;
        
        if (teamRole.user) {
            dto.email = teamRole.user.email;
            dto.firstName = teamRole.user.firstName;
            dto.lastName = teamRole.user.lastName;
            dto.isActive = teamRole.user.isActive;
        }
        
        return dto;
    }

    async findAllTeams(): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAll();
        return teams.map((team: Team) => this.mapToDto(team));
    }

    async findTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findByTenant(tenantId);
        return teams.map((team: Team) => this.mapToDto(team));
    }

    async findTeamById(id: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        return this.mapToDto(team);
    }

    async findTeamMembers(teamId: string): Promise<TeamMemberDto[]> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const teamRoles = await this.teamRoleRepository.findByTeam(teamId);
        return teamRoles.map((teamRole: TeamRole) => this.mapTeamRoleToMemberDto(teamRole));
    }

    async findTeamMember(teamId: string, userId: string): Promise<TeamMemberDto> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const teamRole = await this.teamRoleRepository.findByTeamAndUser(teamId, userId);
        if (!teamRole) {
            throw new NotFoundException(`User with ID ${userId} is not a member of team ${teamId}`);
        }

        return this.mapTeamRoleToMemberDto(teamRole);
    }
}