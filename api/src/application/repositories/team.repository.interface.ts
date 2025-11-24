import { Team } from '../../domain/entities/team.entity';

export interface ITeamRepository {
    create(name: string, description: string | undefined, tenantId: string): Promise<Team>;
    update(id: string, name: string, description: string | undefined): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    findById(id: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    addMember(teamId: string, userId: string): Promise<Team | null>;
    removeMember(teamId: string, userId: string): Promise<Team | null>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';