import { TeamDto } from '../dto/team.dto';
import { TeamMemberDto } from '../dto/team-member.dto';

export interface ITeamQueries {
    findTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
    findTeamById(teamId: string, tenantId: string): Promise<TeamDto>;
    findTeamMembers(teamId: string, tenantId: string): Promise<TeamMemberDto[]>;
    findTeamMemberById(teamId: string, memberId: string, tenantId: string): Promise<TeamMemberDto>;
    findUserTeams(userId: string, tenantId: string): Promise<TeamDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
