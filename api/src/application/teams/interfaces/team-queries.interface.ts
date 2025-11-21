import { TeamResponseDto, TeamMemberResponseDto } from '../dto/team-response.dto';

export interface ITeamQueries {
    findTeamById(id: string, requestingUserTenantId?: string): Promise<TeamResponseDto>;
    findTeamsByTenant(tenantId: string): Promise<TeamResponseDto[]>;
    findTeamMembers(
        teamId: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamMemberResponseDto[]>;
    findAllTeams(): Promise<TeamResponseDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
