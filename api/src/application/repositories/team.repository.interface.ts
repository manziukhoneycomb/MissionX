import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';

export interface ITeamRepository {
    create(team: Team): Promise<Team>;
    update(team: Team): Promise<Team>;
    delete(teamId: string): Promise<void>;
    findByTenant(tenantId: string, relations?: string[]): Promise<Team[]>;
    findByIdAndTenant(teamId: string, tenantId: string, relations?: string[]): Promise<Team | null>;
    findTeamsByUser(userId: string, tenantId: string, relations?: string[]): Promise<Team[]>;

    addMember(teamMember: TeamMember): Promise<TeamMember>;
    updateMember(teamMember: TeamMember): Promise<TeamMember>;
    removeMember(memberId: string): Promise<void>;
    findTeamMembers(teamId: string, relations?: string[]): Promise<TeamMember[]>;
    findTeamMember(
        teamId: string,
        userId: string,
        relations?: string[],
    ): Promise<TeamMember | null>;
    findTeamMemberById(
        teamId: string,
        memberId: string,
        tenantId: string,
        relations?: string[],
    ): Promise<TeamMember | null>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
