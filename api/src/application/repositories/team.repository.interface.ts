import { Team } from '../../domain/entities/team.entity';

export interface ITeamRepository {
    findById(id: string, tenantId?: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    findAll(): Promise<Team[]>;
    create(name: string, description: string | undefined, tenantId: string): Promise<Team>;
    update(id: string, name?: string, description?: string): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    addMember(teamId: string, userId: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
