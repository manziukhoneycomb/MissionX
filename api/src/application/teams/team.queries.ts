import { Injectable, Inject } from '@nestjs/common';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { TeamDto, TeamMemberDto } from './dto/team.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    async getAllTeams(): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAll();
        return teams.map(team => ({
            id: team.id,
            name: team.name,
            description: team.description,
            isActive: team.isActive,
            tenantId: team.tenantId,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        }));
    }

    async getTeamsByTenantId(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findByTenantId(tenantId);
        return teams.map(team => ({
            id: team.id,
            name: team.name,
            description: team.description,
            isActive: team.isActive,
            tenantId: team.tenantId,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        }));
    }

    async getTeamById(id: string): Promise<TeamDto | null> {
        const team = await this.teamRepository.findById(id);
        if (!team) {
            return null;
        }

        return {
            id: team.id,
            name: team.name,
            description: team.description,
            isActive: team.isActive,
            tenantId: team.tenantId,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };
    }

    async getTeamMembers(teamId: string): Promise<TeamMemberDto[]> {
        const teamMemberRoles = await this.teamRepository.getTeamMembers(teamId);
        return teamMemberRoles.map(tmr => ({
            userId: tmr.userId,
            email: tmr.user.email,
            firstName: tmr.user.firstName,
            lastName: tmr.user.lastName,
            teamRole: tmr.roleName,
            joinedAt: tmr.createdAt,
        }));
    }

    async getUserTeams(userId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.getUserTeams(userId);
        return teams.map(team => ({
            id: team.id,
            name: team.name,
            description: team.description,
            isActive: team.isActive,
            tenantId: team.tenantId,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        }));
    }
}