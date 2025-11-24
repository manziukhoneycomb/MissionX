import { TeamDto } from '../dto/team.dto';
import { UserDto } from '../../users/dto/user.dto';

export interface ITeamQueries {
    findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
    findAllTeams(): Promise<TeamDto[]>;
    findTeamById(id: string, requestingUserTenantId?: string): Promise<TeamDto>;
    getTeamUsers(teamId: string, requestingUserTenantId?: string): Promise<UserDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';