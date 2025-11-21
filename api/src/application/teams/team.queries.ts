import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import {
    ITeamMemberRepository,
    TEAM_MEMBER_REPOSITORY,
} from '../repositories/team-member.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamResponseDto, TeamMemberResponseDto } from './dto/team-response.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TEAM_MEMBER_REPOSITORY)
        private readonly teamMemberRepository: ITeamMemberRepository,
    ) {}

    private mapTeamToDto(team: Team): TeamResponseDto {
        const dto: TeamResponseDto = {
            id: team.id,
            name: team.name,
            description: team.description,
            tenant: { id: team.tenant?.id || team.tenantId, name: team.tenant?.name || '' } as Pick<
                TenantDto,
                'id' | 'name'
            >,
            memberCount: team.members?.length || 0,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };

        return dto;
    }

    private mapTeamMemberToDto(teamMember: TeamMember): TeamMemberResponseDto {
        const dto: TeamMemberResponseDto = {
            id: teamMember.id,
            user: {
                id: teamMember.user.id,
                email: teamMember.user.email,
                firstName: teamMember.user.firstName,
                lastName: teamMember.user.lastName,
            },
            role: {
                id: teamMember.role.id,
                name: teamMember.role.name,
            },
            joinedAt: teamMember.joinedAt,
        };

        return dto;
    }

    async findTeamById(id: string, requestingUserTenantId?: string): Promise<TeamResponseDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (requestingUserTenantId !== undefined && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Cannot access team from different tenant.');
        }

        return this.mapTeamToDto(team);
    }

    async findTeamsByTenant(tenantId: string): Promise<TeamResponseDto[]> {
        const teams = await this.teamRepository.findByTenantId(tenantId);
        return teams.map((team) => this.mapTeamToDto(team));
    }

    async findTeamMembers(
        teamId: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<TeamMemberResponseDto[]> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            team.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot access team members from different tenant.');
        }

        const members = await this.teamMemberRepository.findByTeamId(teamId);
        return members.map((member) => this.mapTeamMemberToDto(member));
    }

    async findAllTeams(): Promise<TeamResponseDto[]> {
        const teams = await this.teamRepository.findAll();
        return teams.map((team) => this.mapTeamToDto(team));
    }
}
