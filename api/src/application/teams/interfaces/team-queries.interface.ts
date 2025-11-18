import { TeamDto } from '../dto/team.dto';
import { TeamMemberDto } from '../dto/team-member.dto';

export interface ITeamQueries {
    findAllTeams(): Promise<TeamDto[]>;
    findTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
    findTeamById(id: string): Promise<TeamDto>;
    findTeamMembers(teamId: string): Promise<TeamMemberDto[]>;
    findTeamMember(teamId: string, userId: string): Promise<TeamMemberDto>;
}

export const TEAM_QUERIES = 'ITeamQueries';