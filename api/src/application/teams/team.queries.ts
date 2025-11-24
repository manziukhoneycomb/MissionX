import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { TeamMapper } from './team.mapper';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        private readonly teamMapper: TeamMapper,
    ) {}

    async findAllByTenant(tenantId: string): Promise<TeamDto[]> {
        // If tenantId is empty string, it's a super admin request for all teams
        const teams = tenantId === '' 
            ? await this.teamRepository.findAll()
            : await this.teamRepository.findAllByTenantId(tenantId);

        return this.teamMapper.mapToDtoArray(teams);
    }

    async findById(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (!isSuperAdmin && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('You do not have permission to access this team');
        }

        return this.teamMapper.mapToDto(team) as TeamDto;
    }
}