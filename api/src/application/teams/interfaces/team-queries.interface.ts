import { TeamDto } from '../dto/team.dto';
import { TeamMemberDto } from '../dto/team-member.dto';
import { TeamRoleDto } from '../dto/team-role.dto';

export interface ITeamQueries {
    findAllTeams(): Promise<TeamDto[]>;
    findTeamsByTenant(tenantId: string): Promise<TeamDto[]>;
    findTeamById(id: string): Promise<TeamDto>;
    findTeamByIdWithMembers(id: string): Promise<TeamDto>;
    findTeamMembers(teamId: string): Promise<TeamMemberDto[]>;
    findUserTeams(userId: string): Promise<TeamDto[]>;
    findAllTeamRoles(): Promise<TeamRoleDto[]>;
}

export const TEAM_QUERIES = 'ITeamQueries';
