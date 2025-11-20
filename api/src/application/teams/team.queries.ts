import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team-response.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    private mapToDto(team: Team): TeamDto {
        const dto = new TeamDto();

        (dto as any).id = team.id;
        (dto as any).name = team.name;
        (dto as any).description = team.description;
        (dto as any).tenantId = team.tenantId;
        (dto as any).createdAt = team.createdAt;
        (dto as any).updatedAt = team.updatedAt;

        return dto;
    }

    async findTeamById(id: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        return this.mapToDto(team);
    }

    async findTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findByTenantId(tenantId);

        return teams.map((team) => this.mapToDto(team));
    }

    async getTeamMembers(teamId: string): Promise<any[]> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        return this.teamRepository.getMembers(teamId);
    }
}
