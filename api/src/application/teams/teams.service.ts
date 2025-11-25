import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITeamRepository } from '../repositories/team.repository.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { Team } from '../../domain/entities/team.entity';
import { IUserQueries } from '../../application/users/interfaces/user-queries.interface';

@Injectable()
export class TeamsService {
    constructor(
        @Inject('TEAM_REPOSITORY')
        private readonly teamRepository: ITeamRepository,
        @Inject('USER_QUERIES')
        private readonly userQueries: IUserQueries,
    ) {}

    private mapToDto(team: Team): TeamDto {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            users: team.users?.map((u) => ({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                isActive: u.isActive,
                tenantId: u.tenantId,
            } as any)),
        };
    }

    async findAll(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map((team) => this.mapToDto(team));
    }

    async findById(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        if (team.tenantId !== tenantId) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.mapToDto(team);
    }

    async create(createTeamDto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create(createTeamDto, tenantId);
        return this.mapToDto(team);
    }

    async update(id: string, updateTeamDto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        const updatedTeam = await this.teamRepository.update(id, updateTeamDto);
        return this.mapToDto(updatedTeam!);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);
        if (!team || team.tenantId !== tenantId) {
             throw new NotFoundException(`Team with ID ${id} not found`);
        }
        await this.teamRepository.delete(id);
    }

    async addMember(id: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        const user = await this.userQueries.findUserById(userId, tenantId);
        if (!user) {
             throw new NotFoundException(`User with ID ${userId} not found`);
        }

        await this.teamRepository.addMember(id, userId);
    }

    async removeMember(id: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        
        await this.teamRepository.removeMember(id, userId);
    }
}
