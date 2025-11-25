import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findByTenantId(tenantId: string): Promise<Team[]>;
    create(name: string, description: string | undefined, tenantId: string): Promise<Team>;
    update(id: string, name?: string, description?: string): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    addMember(teamId: string, userId: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
    findMembers(teamId: string): Promise<User[]>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
