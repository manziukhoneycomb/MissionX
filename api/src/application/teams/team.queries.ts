import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { TeamMapper } from './team.mapper';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TeamMapper)
        private readonly teamMapper: TeamMapper,
    ) {}

    async findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map((team) => this.teamMapper.toDto(team));
    }

    async findTeamById(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findTeamWithUsers(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (!isSuperAdmin && requestingUserTenantId && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Access denied to team from different tenant.');
        }

        return this.teamMapper.toDto(team);
    }
}
