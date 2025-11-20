import { TeamMember } from '../../domain/entities/team-member.entity';

export interface CreateTeamMemberDto {
    readonly teamId: string;
    readonly userId: string;
    readonly roleId: string;
}

export interface UpdateTeamMemberRoleDto {
    readonly roleId: string;
}

export interface ITeamMemberRepository {
    findById(id: string): Promise<TeamMember | null>;
    findByTeamId(teamId: string): Promise<readonly TeamMember[]>;
    findByUserId(userId: string): Promise<readonly TeamMember[]>;
    findByTeamIdAndUserId(teamId: string, userId: string): Promise<TeamMember | null>;
    addMember(dto: CreateTeamMemberDto): Promise<TeamMember>;
    removeMember(teamId: string, userId: string): Promise<boolean>;
    updateMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberRoleDto,
    ): Promise<TeamMember | null>;
    getMembersByRole(teamId: string, roleId: string): Promise<readonly TeamMember[]>;
}

export const TEAM_MEMBER_REPOSITORY = 'ITeamMemberRepository';
