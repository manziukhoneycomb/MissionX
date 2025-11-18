import { TeamDto, TeamMemberDto } from '../dto/team.dto';

export interface ITeamQueries {
    getAllTeams(): Promise<TeamDto[]>;
    getTeamsByTenantId(tenantId: string): Promise<TeamDto[]>;
    getTeamById(id: string): Promise<TeamDto | null>;
    getTeamMembers(teamId: string): Promise<TeamMemberDto[]>;
    getUserTeams(userId: string): Promise<TeamDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';