import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { TeamRole } from '../../domain/entities/team-role.entity';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { TeamMemberDto } from './dto/team-member.dto';
import { TeamRoleDto } from './dto/team-role.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @InjectRepository(TeamRole)
        private readonly teamRoleRepository: Repository<TeamRole>,
    ) {}

    private mapTeamToDto(team: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.isActive = team.isActive;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.teamMembers) {
            dto.members = team.teamMembers.map((member) => this.mapTeamMemberToDto(member));
        }

        return dto;
    }

    private mapTeamMemberToDto(member: TeamMember): TeamMemberDto {
        const dto = new TeamMemberDto();
        dto.id = member.id;
        dto.teamId = member.teamId;
        dto.userId = member.userId;
        dto.teamRoleId = member.teamRoleId;
        dto.isActive = member.isActive;
        dto.createdAt = member.createdAt;
        dto.updatedAt = member.updatedAt;

        if (member.user) {
            dto.user = {
                id: member.user.id,
                email: member.user.email,
                firstName: member.user.firstName,
                lastName: member.user.lastName,
            };
        }

        if (member.teamRole) {
            dto.teamRole = {
                id: member.teamRole.id,
                name: member.teamRole.name,
                description: member.teamRole.description,
            };
        }

        return dto;
    }

    private mapTeamRoleToDto(role: TeamRole): TeamRoleDto {
        const dto = new TeamRoleDto();
        dto.id = role.id;
        dto.name = role.name;
        dto.description = role.description;
        return dto;
    }

    async findAllTeams(): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAll();
        return teams.map((team) => this.mapTeamToDto(team));
    }

    async findTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findByTenant(tenantId);
        return teams.map((team) => this.mapTeamToDto(team));
    }

    async findTeamById(id: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.mapTeamToDto(team);
    }

    async findTeamByIdWithMembers(id: string): Promise<TeamDto> {
        const team = await this.teamRepository.findByIdWithMembers(id);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.mapTeamToDto(team);
    }

    async findTeamMembers(teamId: string): Promise<TeamMemberDto[]> {
        const members = await this.teamRepository.getMembersByTeam(teamId);
        return members.map((member) => this.mapTeamMemberToDto(member));
    }

    async findUserTeams(userId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.getUserTeams(userId);
        return teams.map((team) => this.mapTeamToDto(team));
    }

    async findAllTeamRoles(): Promise<TeamRoleDto[]> {
        const roles = await this.teamRoleRepository.find();
        return roles.map((role) => this.mapTeamRoleToDto(role));
    }
}
