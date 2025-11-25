import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TeamDto } from '../dto/team.dto';

export const TEAMS_SERVICE = 'TEAMS_SERVICE';

export interface ITeamsService {
    create(createTeamDto: CreateTeamDto, tenantId: string): Promise<TeamDto>;
    findAll(tenantId: string): Promise<TeamDto[]>;
    findOne(id: string, tenantId: string): Promise<TeamDto>;
    update(id: string, updateTeamDto: UpdateTeamDto, tenantId: string): Promise<TeamDto>;
    remove(id: string, tenantId: string): Promise<void>;
    addMember(teamId: string, userId: string, tenantId: string): Promise<void>;
    removeMember(teamId: string, userId: string, tenantId: string): Promise<void>;
}
