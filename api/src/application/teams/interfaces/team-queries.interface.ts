import { TeamDto } from '../dto/team.dto';
import { TeamMemberDto } from '../dto/team.dto';

export interface ITeamQueries {
    findById(id: string, tenantId: string): Promise<TeamDto>;
    findAll(tenantId: string): Promise<TeamDto[]>;
    findMembers(teamId: string, tenantId: string): Promise<TeamMemberDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
