import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { TeamDto } from './dto/team.dto';
import { TeamMemberDto } from './dto/team-member.dto';
import { TeamMapper, TeamMemberMapper } from './team.mapper';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(@Inject(TEAM_REPOSITORY) private readonly teamRepository: ITeamRepository) {}

    async findTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findByTenant(tenantId);
        return TeamMapper.toDtoList(teams);
    }

    async findTeamById(teamId: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findByIdAndTenant(teamId, tenantId, [
            'members',
            'members.user',
            'members.teamRoles',
        ]);
        if (!team) {
            throw new NotFoundException('Team not found');
        }
        return TeamMapper.toDto(team);
    }

    async findTeamMembers(teamId: string, tenantId: string): Promise<TeamMemberDto[]> {
        const team = await this.teamRepository.findByIdAndTenant(teamId, tenantId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const members = await this.teamRepository.findTeamMembers(teamId, [
            'user',
            'user.roles',
            'teamRoles',
        ]);
        return TeamMemberMapper.toDtoList(members);
    }

    async findTeamMemberById(
        teamId: string,
        memberId: string,
        tenantId: string,
    ): Promise<TeamMemberDto> {
        const teamMember = await this.teamRepository.findTeamMemberById(
            teamId,
            memberId,
            tenantId,
            ['user', 'user.roles', 'teamRoles'],
        );
        if (!teamMember) {
            throw new NotFoundException('Team member not found');
        }
        return TeamMemberMapper.toDto(teamMember);
    }

    async findUserTeams(userId: string, tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findTeamsByUser(userId, tenantId);
        return TeamMapper.toDtoList(teams);
    }
}
