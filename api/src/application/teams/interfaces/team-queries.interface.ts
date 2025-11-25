import { TeamDto } from '../dto/team.dto';

export interface ITeamQueries {
    findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
    findTeamById(id: string, tenantId: string): Promise<TeamDto>;
    findTeamMembers(teamId: string, tenantId: string): Promise<TeamDto>;
}

export const TEAM_QUERIES = 'ITeamQueries';