import { TeamDto } from '../dto/team.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';

export interface ITeamService {
    create(tenantId: string, dto: CreateTeamDto): Promise<TeamDto>;
    update(id: string, tenantId: string, dto: UpdateTeamDto): Promise<TeamDto>;
    delete(id: string, tenantId: string): Promise<void>;
    findById(id: string, tenantId: string): Promise<TeamDto>;
    findAllByTenantId(tenantId: string): Promise<TeamDto[]>;
    addMember(teamId: string, userId: string, tenantId: string): Promise<TeamDto>;
    removeMember(teamId: string, userId: string, tenantId: string): Promise<TeamDto>;
}

export const TEAM_SERVICE = 'ITeamService';
