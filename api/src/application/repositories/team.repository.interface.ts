import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findByTenantId(tenantId: string): Promise<Team[]>;
    findByTenantIdAndName(tenantId: string, name: string): Promise<Team | null>;
    create(dto: CreateTeamDto, tenantId: string): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    addMember(teamId: string, userId: string, roleId?: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
    getMembers(teamId: string): Promise<any[]>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
