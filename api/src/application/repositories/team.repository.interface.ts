import { Team } from '../../domain/entities/team.entity';

export interface CreateTeamDto {
    readonly name: string;
    readonly description?: string;
}

export interface UpdateTeamDto {
    readonly name?: string;
    readonly description?: string;
}

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findByTenantId(tenantId: string): Promise<readonly Team[]>;
    findByName(name: string, tenantId: string): Promise<Team | null>;
    findAll(): Promise<readonly Team[]>;
    create(dto: CreateTeamDto, tenantId: string): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
