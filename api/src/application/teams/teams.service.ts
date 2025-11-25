import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { Team } from '../../domain/entities/team.entity';

@Injectable()
export class TeamsService {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    private mapToDto(team: Team): TeamDto {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            tenant: {
                id: team.tenant.id,
                name: team.tenant.name,
            },
            members: team.members.map((member) => ({
                id: member.id,
                email: member.email,
                firstName: member.firstName,
                lastName: member.lastName,
            })),
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };
    }

    async create(createTeamDto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create(
            createTeamDto.name,
            createTeamDto.description,
            tenantId,
        );

        const fullTeam = await this.teamRepository.findById(team.id, tenantId);

        if (!fullTeam) {
            throw new NotFoundException('Team creation failed.');
        }

        return this.mapToDto(fullTeam);
    }

    async findAll(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map((team) => this.mapToDto(team));
    }

    async findOne(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found.`);
        }

        return this.mapToDto(team);
    }

    async update(id: string, updateTeamDto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        const existingTeam = await this.teamRepository.findById(id, tenantId);

        if (!existingTeam) {
            throw new NotFoundException(`Team with ID ${id} not found.`);
        }

        const updatedTeam = await this.teamRepository.update(
            id,
            updateTeamDto.name,
            updateTeamDto.description,
        );

        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found.`);
        }

        return this.mapToDto(updatedTeam);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found.`);
        }

        const deleted = await this.teamRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} could not be deleted.`);
        }
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found.`);
        }

        await this.teamRepository.addMember(teamId, userId);
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found.`);
        }

        await this.teamRepository.removeMember(teamId, userId);
    }
}
