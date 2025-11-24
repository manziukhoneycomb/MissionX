import { Team } from '../../domain/entities/team.entity';

export interface ITeamRepository {
    create(data: Partial<Team>): Promise<Team>;
    update(id: string, data: Partial<Team>): Promise<Team>;
    delete(id: string): Promise<boolean>;
    findById(id: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    save(team: Team): Promise<Team>;
}
