import { Team } from '../../domain/entities/team.entity';

export interface CreateTeamDto {
    name: string;
    description?: string;
    tenantId: string;
}

export interface UpdateTeamDto {
    name?: string;
    description?: string;
}

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    create(dto: CreateTeamDto): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    addMember(teamId: string, userId: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
    findTeamMembers(teamId: string): Promise<Team | null>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';