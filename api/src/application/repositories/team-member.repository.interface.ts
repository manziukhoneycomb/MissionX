import { TeamMember } from '../../domain/entities/team-member.entity';
import { AddTeamMemberDto } from '../teams/dto/add-team-member.dto';

export interface ITeamMemberRepository {
    addMember(dto: AddTeamMemberDto): Promise<TeamMember>;
    removeMember(teamId: string, userId: string): Promise<boolean>;
    findByTeamId(teamId: string): Promise<TeamMember[]>;
    findByUserId(userId: string): Promise<TeamMember[]>;
    findByTeamAndUser(teamId: string, userId: string): Promise<TeamMember | null>;
    updateMemberRole(teamId: string, userId: string, teamRoleId: string | null): Promise<TeamMember | null>;
}

export const TEAM_MEMBER_REPOSITORY = 'ITeamMemberRepository';