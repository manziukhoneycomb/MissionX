import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import { AddTeamMemberDto } from '../dto/add-team-member.dto';
import { CreateTeamRoleDto } from '../dto/create-team-role.dto';
import { UpdateTeamRoleDto } from '../dto/update-team-role.dto';

export interface ITeamCommands {
    createTeam(dto: CreateTeamDto): Promise<TeamResponseDto>;
    updateTeam(id: string, dto: UpdateTeamDto, tenantId: string): Promise<TeamResponseDto>;
    deleteTeam(id: string, tenantId: string): Promise<void>;
    addTeamMember(dto: AddTeamMemberDto): Promise<void>;
    removeTeamMember(teamId: string, userId: string): Promise<void>;
    updateTeamMemberRole(teamId: string, userId: string, teamRoleId: string | null): Promise<void>;
    createTeamRole(dto: CreateTeamRoleDto): Promise<any>;
    updateTeamRole(id: string, dto: UpdateTeamRoleDto): Promise<any>;
    deleteTeamRole(id: string): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';