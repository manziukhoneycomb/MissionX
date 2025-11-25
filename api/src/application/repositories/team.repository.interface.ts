import { Team } from '../../domain/entities/team.entity';

export const TEAM_REPOSITORY = 'TEAM_REPOSITORY';

export interface ITeamRepository {
    create(team: Partial<Team>): Promise<Team>;
    update(id: string, team: Partial<Team>): Promise<Team>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    addMember(teamId: string, userId: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
}
