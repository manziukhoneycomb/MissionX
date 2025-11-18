import { TeamDto, AddTeamMemberDto, UpdateTeamMemberRoleDto } from '../dto/team.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';

export interface ITeamCommands {
    createTeam(input: CreateTeamDto): Promise<TeamDto>;
    updateTeam(id: string, input: UpdateTeamDto): Promise<TeamDto>;
    deleteTeam(id: string): Promise<void>;
    addTeamMember(teamId: string, input: AddTeamMemberDto): Promise<void>;
    removeTeamMember(teamId: string, userId: string): Promise<void>;
    updateTeamMemberRole(teamId: string, userId: string, input: UpdateTeamMemberRoleDto): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';