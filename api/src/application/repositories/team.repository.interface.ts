import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';

export interface ITeamRepository {
    findById(id: string, tenantId: string): Promise<Team | null>;
    findByTenantId(tenantId: string): Promise<Team[]>;
    create(name: string, description: string | undefined, tenantId: string): Promise<Team>;
    update(id: string, tenantId: string, name?: string, description?: string): Promise<Team | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    addMember(teamId: string, userId: string, tenantId: string): Promise<void>;
    removeMember(teamId: string, userId: string, tenantId: string): Promise<void>;
    findMembers(teamId: string, tenantId: string): Promise<User[]>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
