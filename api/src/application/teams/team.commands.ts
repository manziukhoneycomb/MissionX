import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { TeamDto, AddTeamMemberDto, UpdateTeamMemberRoleDto } from './dto/team.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    async createTeam(input: CreateTeamDto): Promise<TeamDto> {
        const team = await this.teamRepository.create(input);
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            isActive: team.isActive,
            tenantId: team.tenantId,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };
    }

    async updateTeam(id: string, input: UpdateTeamDto): Promise<TeamDto> {
        const existingTeam = await this.teamRepository.findById(id);
        if (!existingTeam) {
            throw new NotFoundException('Team not found');
        }

        const updatedTeam = await this.teamRepository.update(id, input);
        return {
            id: updatedTeam.id,
            name: updatedTeam.name,
            description: updatedTeam.description,
            isActive: updatedTeam.isActive,
            tenantId: updatedTeam.tenantId,
            createdAt: updatedTeam.createdAt,
            updatedAt: updatedTeam.updatedAt,
        };
    }

    async deleteTeam(id: string): Promise<void> {
        const existingTeam = await this.teamRepository.findById(id);
        if (!existingTeam) {
            throw new NotFoundException('Team not found');
        }

        await this.teamRepository.delete(id);
    }

    async addTeamMember(teamId: string, input: AddTeamMemberDto): Promise<void> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        await this.teamRepository.addMember(teamId, input.userId, input.teamRole);
    }

    async removeTeamMember(teamId: string, userId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        await this.teamRepository.removeMember(teamId, userId);
    }

    async updateTeamMemberRole(teamId: string, userId: string, input: UpdateTeamMemberRoleDto): Promise<void> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        await this.teamRepository.updateMemberRole(teamId, userId, input.teamRole);
    }
}