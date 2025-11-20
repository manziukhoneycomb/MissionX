import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';
import { AddTeamMemberDto } from '../teams/dto/add-team-member.dto';

export interface ITeamRepository {
    findById(id: string): Promise<Team | null>;
    findByIdAndTenant(id: string, tenantId: string): Promise<Team | null>;
    findByTenant(tenantId: string): Promise<Team[]>;
    findByUser(userId: string): Promise<Team[]>;
    create(dto: CreateTeamDto, tenantId: string, ownerId: string): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<boolean>;

    findTeamMember(teamId: string, userId: string): Promise<TeamMember | null>;
    findTeamMembers(teamId: string): Promise<TeamMember[]>;
    addTeamMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMember>;
    removeTeamMember(teamId: string, memberId: string): Promise<boolean>;
    updateTeamMemberRole(memberId: string, role: string): Promise<TeamMember | null>;
    findTeamMemberById(memberId: string): Promise<TeamMember | null>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
