import { TeamDto } from '../dto/team.dto';
import { TeamMemberDto } from '../dto/team-member.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { AddTeamMemberDto } from '../dto/add-team-member.dto';
import { UpdateTeamMemberDto } from '../dto/update-team-member.dto';

export interface ITeamCommands {
    createTeam(tenantId: string, input: CreateTeamDto): Promise<TeamDto>;
    updateTeam(teamId: string, tenantId: string, input: UpdateTeamDto): Promise<TeamDto>;
    deleteTeam(teamId: string, tenantId: string): Promise<void>;
    addTeamMember(
        teamId: string,
        tenantId: string,
        input: AddTeamMemberDto,
    ): Promise<TeamMemberDto>;
    updateTeamMember(
        teamId: string,
        memberId: string,
        tenantId: string,
        input: UpdateTeamMemberDto,
    ): Promise<TeamMemberDto>;
    removeTeamMember(teamId: string, memberId: string, tenantId: string): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';
