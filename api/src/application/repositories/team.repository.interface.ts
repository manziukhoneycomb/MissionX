import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    create(dto: CreateTeamDto, tenantId: string): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    addUsers(teamId: string, userIds: string[]): Promise<Team>;
    removeUsers(teamId: string, userIds: string[]): Promise<Team>;
    findTeamWithUsers(id: string): Promise<Team | null>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
