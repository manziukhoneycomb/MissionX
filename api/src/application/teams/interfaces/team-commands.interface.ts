import { TeamDto } from '../dto/team.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';

export interface ITeamCommands {
    create(dto: CreateTeamDto, tenantId: string): Promise<TeamDto>;
    update(id: string, dto: UpdateTeamDto, tenantId: string, isSuperAdmin: boolean): Promise<TeamDto>;
    delete(id: string, tenantId: string, isSuperAdmin: boolean): Promise<void>;
    addUsersToTeam(teamId: string, userIds: string[], tenantId: string, isSuperAdmin: boolean): Promise<TeamDto>;
    removeUsersFromTeam(teamId: string, userIds: string[], tenantId: string, isSuperAdmin: boolean): Promise<TeamDto>;
}

export const TEAM_COMMANDS = 'ITeamCommands';