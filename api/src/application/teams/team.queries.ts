import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    private mapToDto(team: Team): TeamDto {
        const dto = new TeamDto();

        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.tenant) {
            dto.tenant = { id: team.tenant.id, name: team.tenant.name } as Pick<
                TenantDto,
                'id' | 'name'
            >;
        }

        if (team.members) {
            dto.members = team.members.map((member) => ({
                id: member.id,
                email: member.email,
                firstName: member.firstName,
                lastName: member.lastName,
            }));
        } else {
            dto.members = [];
        }

        return dto;
    }

    async findTeamById(id: string, tenantId?: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (tenantId !== undefined && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot access team from different tenant.');
        }

        return this.mapToDto(team);
    }

    async findAllTeams(): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAll();

        return teams.map((team) => this.mapToDto(team));
    }

    async findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);

        return teams.map((team) => this.mapToDto(team));
    }
}
