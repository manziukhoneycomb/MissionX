import { Team } from '../../domain/entities/team.entity';
import { TeamMemberRole } from '../../domain/entities/team-member-role.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';

export interface ITeamRepository {
    findAll(): Promise<Team[]>;
    findByTenantId(tenantId: string): Promise<Team[]>;
    findById(id: string): Promise<Team | null>;
    findByIdWithMembers(id: string): Promise<Team | null>;
    create(teamData: CreateTeamDto): Promise<Team>;
    update(id: string, teamData: UpdateTeamDto): Promise<Team>;
    delete(id: string): Promise<void>;
    addMember(teamId: string, userId: string, roleName: string): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
    updateMemberRole(teamId: string, userId: string, roleName: string): Promise<void>;
    getTeamMembers(teamId: string): Promise<TeamMemberRole[]>;
    getUserTeams(userId: string): Promise<Team[]>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';