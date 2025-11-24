import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { Team } from '../../domain/entities/team.entity';

@Injectable()
export class TeamsService {
    constructor(
        @Inject(TEAM_REPOSITORY) private readonly teamRepository: ITeamRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    ) {}

    async create(createTeamDto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create(
            createTeamDto.name,
            createTeamDto.description,
            tenantId,
        );
        return this.toDto(team);
    }

    async findAll(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map(team => this.toDto(team));
    }

    async findOne(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException('Team not found');
        }
        return this.toDto(team);
    }

    async update(id: string, updateTeamDto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException('Team not found');
        }

        const updatedTeam = await this.teamRepository.update(
            id,
            updateTeamDto.name,
            updateTeamDto.description,
        );
        if (!updatedTeam) {
            throw new NotFoundException('Team not found');
        }
        return this.toDto(updatedTeam);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException('Team not found');
        }

        const deleted = await this.teamRepository.delete(id);
        if (!deleted) {
            throw new NotFoundException('Team not found');
        }
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(teamId);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException('Team not found');
        }

        const user = await this.userRepository.findById(userId);
        if (!user || user.tenantId !== tenantId) {
            throw new BadRequestException('User not found or belongs to different tenant');
        }

        const updatedTeam = await this.teamRepository.addMember(teamId, userId);
        if (!updatedTeam) {
            throw new NotFoundException('Failed to add member');
        }
        return this.toDto(updatedTeam);
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(teamId);
        if (!team || team.tenantId !== tenantId) {
            throw new NotFoundException('Team not found');
        }

        const updatedTeam = await this.teamRepository.removeMember(teamId, userId);
        if (!updatedTeam) {
            throw new NotFoundException('Failed to remove member');
        }
        return this.toDto(updatedTeam);
    }

    private toDto(team: Team): TeamDto {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            tenantId: team.tenantId,
            users: team.users?.map(user => ({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
                tenantId: user.tenantId,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                roles: user.roles?.map(role => ({
                    id: role.id,
                    name: role.name,
                })) || [],
            })) || [],
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };
    }
}