import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TeamDto } from '../dto/team.dto';

export interface ITeamCommands {
    create(dto: CreateTeamDto, tenantId: string): Promise<TeamDto>;
    update(id: string, dto: UpdateTeamDto, tenantId: string): Promise<TeamDto>;
    delete(id: string, tenantId: string): Promise<void>;
    addMember(teamId: string, userId: string, tenantId: string): Promise<void>;
    removeMember(teamId: string, userId: string, tenantId: string): Promise<void>;
}

export const TEAM_COMMANDS = 'ITeamCommands';
