import { TeamDto } from '../dto/team-response.dto';

export interface ITeamQueries {
    findTeamById(id: string): Promise<TeamDto>;
    findTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
    getTeamMembers(teamId: string): Promise<any[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
