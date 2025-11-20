import { TeamResponseDto } from '../dto/team-response.dto';

export interface ITeamQueries {
    findAllTeams(tenantId: string): Promise<TeamResponseDto[]>;
    findTeamById(id: string, tenantId: string): Promise<TeamResponseDto>;
    findTeamsByUserId(userId: string, tenantId: string): Promise<TeamResponseDto[]>;
    findTeamMembers(teamId: string): Promise<any[]>;
    findTeamRoles(teamId: string): Promise<any[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';