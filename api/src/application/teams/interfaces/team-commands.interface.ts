import { CreateTeamDto, CreateTeamBySuperAdminDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { ManageTeamUsersDto } from '../dto/manage-team-users.dto';
import { TeamDto } from '../dto/team.dto';

export interface ITeamCommands {
    createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto>;
    createTeamBySuperAdmin(dto: CreateTeamBySuperAdminDto): Promise<TeamDto>;
    updateTeam(
        id: string,
        dto: UpdateTeamDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto>;
    deleteTeam(
        id: string, 
        requestingUserTenantId?: string, 
        isSuperAdmin?: boolean
    ): Promise<void>;
    addUsersToTeam(
        teamId: string,
        dto: ManageTeamUsersDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto>;
    removeUsersFromTeam(
        teamId: string,
        dto: ManageTeamUsersDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto>;
}

export const TEAM_COMMANDS = 'ITeamCommands';