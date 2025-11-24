import { TeamDto } from '../dto/team.dto';

export interface ITeamQueries {
    findAllByTenant(tenantId: string): Promise<TeamDto[]>;
    findById(
        id: string, 
        requestingUserTenantId?: string, 
        isSuperAdmin?: boolean
    ): Promise<TeamDto>;
}

export const TEAM_QUERIES = 'ITeamQueries';