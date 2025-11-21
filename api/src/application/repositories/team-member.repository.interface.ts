import { TeamMember } from '../../domain/entities/team-member.entity';

export interface AddTeamMemberDto {
    readonly userId: string;
    readonly roleId: string;
}

export interface UpdateTeamMemberDto {
    readonly roleId: string;
}

export interface ITeamMemberRepository {
    findByTeamId(teamId: string): Promise<readonly TeamMember[]>;
    findByUserId(userId: string): Promise<readonly TeamMember[]>;
    findByTeamAndUserId(teamId: string, userId: string): Promise<TeamMember | null>;
    addMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMember>;
    updateMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberDto,
    ): Promise<TeamMember | null>;
    removeMember(teamId: string, userId: string): Promise<boolean>;
}

export const TEAM_MEMBER_REPOSITORY = 'ITeamMemberRepository';
