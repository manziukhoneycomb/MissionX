import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ITeamRepository } from '../repositories/team.repository.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { Team } from '../../domain/entities/team.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

@Injectable()
export class TeamsService {
    constructor(
        @Inject('TEAM_REPOSITORY')
        private readonly teamRepository: ITeamRepository,
        @Inject('USER_REPOSITORY')
        private readonly userRepository: IUserRepository,
    ) {}

    private mapToDto(team: Team): TeamDto {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            tenantId: team.tenantId,
            users: team.users?.map(u => ({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                isActive: u.isActive,
                tenantId: u.tenantId!,
                // Map other fields if necessary, matching UserDto
            } as any)), // Casting to any to avoid strict UserDto mapping issues here
        };
    }

    async create(createTeamDto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create(createTeamDto, tenantId);
        return this.mapToDto(team);
    }

    async findAll(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map(team => this.mapToDto(team));
    }

    async findOne(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return this.mapToDto(team);
    }

    async update(id: string, updateTeamDto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        const updatedTeam = await this.teamRepository.update(id, updateTeamDto);
        return this.mapToDto(updatedTeam);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        await this.teamRepository.delete(id);
    }

    async addMember(id: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (user.tenantId !== tenantId) {
            throw new ForbiddenException('User does not belong to this tenant');
        }

        await this.teamRepository.addMember(id, userId);
    }

    async removeMember(id: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id, tenantId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        await this.teamRepository.removeMember(id, userId);
    }
}
