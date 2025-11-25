import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TeamDto } from '../dto/team.dto';

export interface ITeamCommands {
    createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto>;
    updateTeam(id: string, dto: UpdateTeamDto, tenantId: string): Promise<TeamDto>;
    deleteTeam(id: string, tenantId: string): Promise<void>;
    addMemberToTeam(teamId: string, userId: string, tenantId: string): Promise<void>;
    removeMemberFromTeam(teamId: string, userId: string, tenantId: string): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';