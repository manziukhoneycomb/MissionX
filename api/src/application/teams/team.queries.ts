import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { TeamMapper } from './team.mapper';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        private readonly teamMapper: TeamMapper,
    ) {}

    async findAllByTenant(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return this.teamMapper.toDtoList(teams);
    }

    async findById(
        id: string,
        tenantId: string,
        isSuperAdmin: boolean
    ): Promise<TeamDto> {
        const team = isSuperAdmin 
            ? await this.teamRepository.findById(id)
            : await this.teamRepository.findByIdAndTenantId(id, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (!isSuperAdmin && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot access team from different tenant');
        }

        return this.teamMapper.toDto(team);
    }
}