import { TeamDto } from '../dto/team.dto';

export interface ITeamQueries {
    findTeamById(id: string, tenantId?: string): Promise<TeamDto>;
    findAllTeams(): Promise<TeamDto[]>;
    findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
