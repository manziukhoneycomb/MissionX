import { Team } from '../../domain/entities/team.entity';

export interface ITeamRepository {
    create(team: Partial<Team>): Promise<Team>;
    findAll(): Promise<Team[]>;
    findById(id: string): Promise<Team | null>;
    findByTenant(tenantId: string): Promise<Team[]>;
    findByUser(userId: string): Promise<Team[]>;
    findWithMembers(id: string): Promise<Team | null>;
    update(id: string, updates: Partial<Team>): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';