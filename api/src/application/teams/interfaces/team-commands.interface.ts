import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import { AddTeamMemberDto, UpdateTeamMemberRoleDto } from '../dto/add-team-member.dto';

export interface ITeamCommands {
    createTeam(dto: CreateTeamDto, tenantId: string, ownerId: string): Promise<TeamResponseDto>;
    updateTeam(
        id: string,
        dto: UpdateTeamDto,
        tenantId: string,
        requestingUserId: string,
    ): Promise<TeamResponseDto>;
    deleteTeam(id: string, tenantId: string, requestingUserId: string): Promise<void>;
    addTeamMember(
        teamId: string,
        dto: AddTeamMemberDto,
        tenantId: string,
        requestingUserId: string,
    ): Promise<void>;
    removeTeamMember(
        teamId: string,
        memberId: string,
        tenantId: string,
        requestingUserId: string,
    ): Promise<void>;
    updateTeamMemberRole(
        teamId: string,
        memberId: string,
        dto: UpdateTeamMemberRoleDto,
        tenantId: string,
        requestingUserId: string,
    ): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';
