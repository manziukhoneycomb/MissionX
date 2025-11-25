import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';

export interface ITeamRepository {
    create(dto: CreateTeamDto, tenantId: string): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Team | null>;
    findAllByTenantId(tenantId: string): Promise<Team[]>;
    addMember(teamId: string, userId: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
}
