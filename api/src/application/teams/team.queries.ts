import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamMemberRepository, TEAM_MEMBER_REPOSITORY } from '../repositories/team-member.repository.interface';
import { ITeamRoleRepository, TEAM_ROLE_REPOSITORY } from '../repositories/team-role.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamResponseDto } from './dto/team-response.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TEAM_MEMBER_REPOSITORY)
        private readonly teamMemberRepository: ITeamMemberRepository,
        @Inject(TEAM_ROLE_REPOSITORY)
        private readonly teamRoleRepository: ITeamRoleRepository,
    ) {}

    private mapToResponseDto(team: Team): TeamResponseDto {
        const dto = new TeamResponseDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;
        return dto;
    }

    async findAllTeams(tenantId: string): Promise<TeamResponseDto[]> {
        const teams = await this.teamRepository.findAll(tenantId);
        return teams.map(team => this.mapToResponseDto(team));
    }

    async findTeamById(id: string, tenantId: string): Promise<TeamResponseDto> {
        const team = await this.teamRepository.findById(id, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.mapToResponseDto(team);
    }

    async findTeamsByUserId(userId: string, tenantId: string): Promise<TeamResponseDto[]> {
        const teamMembers = await this.teamMemberRepository.findByUserId(userId);
        const teams = await Promise.all(
            teamMembers.map(async (member) => {
                const team = await this.teamRepository.findById(member.teamId, tenantId);
                return team;
            })
        );
        
        return teams
            .filter(team => team !== null)
            .map(team => this.mapToResponseDto(team as Team));
    }

    async findTeamMembers(teamId: string): Promise<any[]> {
        return await this.teamMemberRepository.findByTeamId(teamId);
    }

    async findTeamRoles(teamId: string): Promise<any[]> {
        return await this.teamRoleRepository.findByTeamId(teamId);
    }
}