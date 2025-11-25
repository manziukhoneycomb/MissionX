import { TeamDto } from '../dto/team.dto';
import { TeamMemberDto } from '../dto/team.dto';

export interface ITeamQueries {
    findTeamById(id: string, tenantId: string): Promise<TeamDto>;
    findAllTeams(tenantId: string): Promise<TeamDto[]>;
    findTeamMembers(teamId: string, tenantId: string): Promise<TeamMemberDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
