import { TeamDto } from '../dto/team.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { AddTeamMemberDto } from '../dto/add-team-member.dto';
import { TeamMemberDto } from '../dto/team-member.dto';

export interface ITeamCommands {
    createTeam(input: CreateTeamDto): Promise<TeamDto>;
    updateTeam(id: string, input: UpdateTeamDto): Promise<TeamDto>;
    deleteTeam(id: string): Promise<void>;
    addTeamMember(teamId: string, input: AddTeamMemberDto): Promise<TeamMemberDto>;
    removeTeamMember(teamId: string, userId: string): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';