import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';

export interface ITeamRepository {
    create(tenantId: string, dto: CreateTeamDto): Promise<Team>;
    update(id: string, tenantId: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    findById(id: string, tenantId: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    addMember(teamId: string, userId: string, tenantId: string): Promise<Team | null>;
    removeMember(teamId: string, userId: string, tenantId: string): Promise<Team | null>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
