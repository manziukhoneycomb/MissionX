import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import {
    CreateTeamDto,
    CreateTeamBySuperAdminDto,
} from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    findAll(): Promise<Team[]>;
    create(
        dto: CreateTeamDto | CreateTeamBySuperAdminDto,
        tenantId: string,
    ): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    addUsersToTeam(teamId: string, userIds: string[]): Promise<Team | null>;
    removeUsersFromTeam(teamId: string, userIds: string[]): Promise<Team | null>;
    getTeamUsers(teamId: string): Promise<User[]>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';