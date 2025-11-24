import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITeamService } from './interfaces/team.service.interface';
import { TeamDto } from './dto/team.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { TeamMapper } from './team.mapper';

@Injectable()
export class TeamsService implements ITeamService {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        private readonly teamMapper: TeamMapper,
    ) {}

    async create(tenantId: string, dto: CreateTeamDto): Promise<TeamDto> {
        const team = await this.teamRepository.create(tenantId, dto);
        return this.teamMapper.toDto(team);
    }

    async update(id: string, tenantId: string, dto: UpdateTeamDto): Promise<TeamDto> {
        const team = await this.teamRepository.update(id, tenantId, dto);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.teamMapper.toDto(team);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        const success = await this.teamRepository.delete(id, tenantId);
        if (!success) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async findById(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.teamMapper.toDto(team);
    }

    async findAllByTenantId(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map((team) => this.teamMapper.toDto(team));
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.addMember(teamId, userId, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }
        return this.teamMapper.toDto(team);
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.removeMember(teamId, userId, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }
        return this.teamMapper.toDto(team);
    }
}
