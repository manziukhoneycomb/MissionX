import { TeamRole } from '../../domain/entities/team-role.entity';
import { CreateTeamRoleDto } from '../teams/dto/create-team-role.dto';
import { UpdateTeamRoleDto } from '../teams/dto/update-team-role.dto';

export interface ITeamRoleRepository {
    create(dto: CreateTeamRoleDto): Promise<TeamRole>;
    findByTeamId(teamId: string): Promise<TeamRole[]>;
    findById(id: string): Promise<TeamRole | null>;
    findByNameAndTeam(name: string, teamId: string): Promise<TeamRole | null>;
    update(id: string, dto: UpdateTeamRoleDto): Promise<TeamRole | null>;
    delete(id: string): Promise<boolean>;
}

export const TEAM_ROLE_REPOSITORY = 'ITeamRoleRepository';