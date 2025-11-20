import { TeamResponseDto, TeamMemberDto } from '../dto/team-response.dto';

export interface ITeamQueries {
    findTeamById(id: string, tenantId: string, requestingUserId: string): Promise<TeamResponseDto>;
    findTeamsByTenant(tenantId: string, requestingUserId: string): Promise<TeamResponseDto[]>;
    findTeamMembers(
        teamId: string,
        tenantId: string,
        requestingUserId: string,
    ): Promise<TeamMemberDto[]>;
    findTeamsByUser(userId: string, tenantId: string): Promise<TeamResponseDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
