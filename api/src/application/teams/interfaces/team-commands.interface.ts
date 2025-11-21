import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { AddTeamMemberDto } from '../dto/add-team-member.dto';
import { UpdateTeamMemberDto } from '../dto/update-team-member.dto';
import { TeamDto } from '../dto/team.dto';
import { TeamMemberDto } from '../dto/team-member.dto';

export interface ITeamCommands {
    createTeam(dto: CreateTeamDto): Promise<TeamDto>;
    updateTeam(id: string, dto: UpdateTeamDto): Promise<TeamDto>;
    deleteTeam(id: string): Promise<void>;
    addTeamMember(dto: AddTeamMemberDto): Promise<TeamMemberDto>;
    removeTeamMember(teamId: string, userId: string): Promise<void>;
    updateTeamMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberDto,
    ): Promise<TeamMemberDto>;
}

export const TEAM_COMMANDS = 'ITeamCommands';
