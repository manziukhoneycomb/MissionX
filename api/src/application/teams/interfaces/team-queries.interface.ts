import { TeamDto } from '../dto/team.dto';

export interface ITeamQueries {
    findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
    findTeamById(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto>;
}

export const TEAM_QUERIES = 'ITeamQueries';
