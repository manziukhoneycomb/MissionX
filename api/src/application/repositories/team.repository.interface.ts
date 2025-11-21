import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { UpdateTeamDto } from '../teams/dto/update-team.dto';
import { AddTeamMemberDto } from '../teams/dto/add-team-member.dto';
import { UpdateTeamMemberDto } from '../teams/dto/update-team-member.dto';

export interface ITeamRepository {
    create(dto: CreateTeamDto): Promise<Team>;
    findAll(): Promise<Team[]>;
    findByTenant(tenantId: string): Promise<Team[]>;
    findById(id: string): Promise<Team | null>;
    findByIdWithMembers(id: string): Promise<Team | null>;
    update(id: string, dto: UpdateTeamDto): Promise<Team | null>;
    delete(id: string): Promise<boolean>;
    addMember(dto: AddTeamMemberDto): Promise<TeamMember>;
    removeMember(teamId: string, userId: string): Promise<boolean>;
    updateMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberDto,
    ): Promise<TeamMember | null>;
    getMembersByTeam(teamId: string): Promise<TeamMember[]>;
    getUserTeams(userId: string): Promise<Team[]>;
}

export const TEAM_REPOSITORY = 'ITeamRepository';
