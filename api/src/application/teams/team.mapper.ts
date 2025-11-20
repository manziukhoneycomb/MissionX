import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { TeamDto } from './dto/team.dto';
import { TeamMemberDto } from './dto/team-member.dto';

export class TeamMapper {
    static toDto(team: Team): TeamDto {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            isActive: team.isActive,
            tenantId: team.tenantId,
            members: team.members?.map((member) => TeamMemberMapper.toDto(member)),
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };
    }

    static toDtoList(teams: Team[]): TeamDto[] {
        return teams.map((team) => this.toDto(team));
    }
}

export class TeamMemberMapper {
    static toDto(teamMember: TeamMember): TeamMemberDto {
        return {
            id: teamMember.id,
            teamId: teamMember.teamId,
            userId: teamMember.userId,
            isActive: teamMember.isActive,
            user: teamMember.user
                ? {
                      id: teamMember.user.id,
                      email: teamMember.user.email,
                      firstName: teamMember.user.firstName,
                      lastName: teamMember.user.lastName,
                      isActive: teamMember.user.isActive,
                      tenant: teamMember.user.tenant ? {
                          id: teamMember.user.tenant.id,
                          name: teamMember.user.tenant.name,
                      } : { id: teamMember.user.tenantId || '', name: '' },
                      roles: teamMember.user.roles?.map((role) => ({
                          id: role.id,
                          name: role.name,
                      })) || [],
                      createdAt: teamMember.user.createdAt,
                      updatedAt: teamMember.user.updatedAt,
                  }
                : undefined,
            teamRoles: teamMember.teamRoles?.map((role) => ({
                id: role.id,
                name: role.name,
            })),
            createdAt: teamMember.createdAt,
            updatedAt: teamMember.updatedAt,
        };
    }

    static toDtoList(teamMembers: TeamMember[]): TeamMemberDto[] {
        return teamMembers.map((member) => this.toDto(member));
    }
}
