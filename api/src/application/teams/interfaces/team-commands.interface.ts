import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { AddTeamMemberDto } from '../dto/add-team-member.dto';
import { TeamResponseDto, TeamMemberResponseDto } from '../dto/team-response.dto';

export interface ITeamCommands {
    createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamResponseDto>;
    updateTeam(
        id: string,
        dto: UpdateTeamDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamResponseDto>;
    deleteTeam(id: string, requestingUserTenantId?: string, isSuperAdmin?: boolean): Promise<void>;
    addTeamMember(
        teamId: string,
        dto: AddTeamMemberDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamMemberResponseDto>;
    removeTeamMember(
        teamId: string,
        userId: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';
