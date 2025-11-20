import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';

export interface ITeamRepository {
    create(dto: CreateTeamDto): Promise<Team>;
    findAll(tenantId: string): Promise<Team[]>;
    findById(id: string, tenantId: string): Promise<Team | null>;
    findByName(name: string, tenantId: string): Promise<Team | null>;
    update(id: string, dto: UpdateTeamDto, tenantId: string): Promise<Team | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';