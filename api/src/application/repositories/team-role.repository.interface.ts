import { TeamRole } from '../../domain/entities/team-role.entity';
import { RoleName } from '../../domain/enums/role-name.enum';

export interface ITeamRoleRepository {
    create(teamId: string, userId: string, role: RoleName): Promise<TeamRole>;
    findByTeam(teamId: string): Promise<TeamRole[]>;
    findByUser(userId: string): Promise<TeamRole[]>;
    findByTeamAndUser(teamId: string, userId: string): Promise<TeamRole | null>;
    updateRole(teamId: string, userId: string, role: RoleName): Promise<TeamRole | null>;
    delete(teamId: string, userId: string): Promise<boolean>;
}

export const TEAM_ROLE_REPOSITORY = 'ITeamRoleRepository';