import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamMemberRepository, TEAM_MEMBER_REPOSITORY } from '../repositories/team-member.repository.interface';
import { ITeamRoleRepository, TEAM_ROLE_REPOSITORY } from '../repositories/team-role.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { CreateTeamRoleDto } from './dto/create-team-role.dto';
import { UpdateTeamRoleDto } from './dto/update-team-role.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TEAM_MEMBER_REPOSITORY)
        private readonly teamMemberRepository: ITeamMemberRepository,
        @Inject(TEAM_ROLE_REPOSITORY)
        private readonly teamRoleRepository: ITeamRoleRepository,
    ) {}

    private mapToResponseDto(team: Team): TeamResponseDto {
        const dto = new TeamResponseDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;
        return dto;
    }

    async createTeam(dto: CreateTeamDto): Promise<TeamResponseDto> {
        const existingTeam = await this.teamRepository.findByName(dto.name, dto.tenantId);
        if (existingTeam) {
            throw new BadRequestException('Team name already exists in this tenant.');
        }

        const createdTeam = await this.teamRepository.create(dto);
        return this.mapToResponseDto(createdTeam);
    }

    async updateTeam(id: string, dto: UpdateTeamDto, tenantId: string): Promise<TeamResponseDto> {
        if (Object.keys(dto).length === 0) {
            const team = await this.teamRepository.findById(id, tenantId);
            if (!team) {
                throw new NotFoundException(`Team with ID ${id} not found`);
            }
            return this.mapToResponseDto(team);
        }

        if (dto.name) {
            const existingTeam = await this.teamRepository.findByName(dto.name, tenantId);
            if (existingTeam && existingTeam.id !== id) {
                throw new BadRequestException('Team name already exists in this tenant.');
            }
        }

        const updatedTeam = await this.teamRepository.update(id, dto, tenantId);
        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found or could not be updated.`);
        }

        return this.mapToResponseDto(updatedTeam);
    }

    async deleteTeam(id: string, tenantId: string): Promise<void> {
        const deleted = await this.teamRepository.delete(id, tenantId);
        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async addTeamMember(dto: AddTeamMemberDto): Promise<void> {
        const existingMember = await this.teamMemberRepository.findByTeamAndUser(dto.teamId, dto.userId);
        if (existingMember) {
            throw new BadRequestException('User is already a member of this team.');
        }

        if (dto.teamRoleId) {
            const teamRole = await this.teamRoleRepository.findById(dto.teamRoleId);
            if (!teamRole || teamRole.teamId !== dto.teamId) {
                throw new BadRequestException('Invalid team role for this team.');
            }
        }

        await this.teamMemberRepository.addMember(dto);
    }

    async removeTeamMember(teamId: string, userId: string): Promise<void> {
        const removed = await this.teamMemberRepository.removeMember(teamId, userId);
        if (!removed) {
            throw new NotFoundException('Team member not found.');
        }
    }

    async updateTeamMemberRole(teamId: string, userId: string, teamRoleId: string | null): Promise<void> {
        if (teamRoleId) {
            const teamRole = await this.teamRoleRepository.findById(teamRoleId);
            if (!teamRole || teamRole.teamId !== teamId) {
                throw new BadRequestException('Invalid team role for this team.');
            }
        }

        const updatedMember = await this.teamMemberRepository.updateMemberRole(teamId, userId, teamRoleId);
        if (!updatedMember) {
            throw new NotFoundException('Team member not found.');
        }
    }

    async createTeamRole(dto: CreateTeamRoleDto): Promise<any> {
        const existingRole = await this.teamRoleRepository.findByNameAndTeam(dto.name, dto.teamId);
        if (existingRole) {
            throw new BadRequestException('Role name already exists in this team.');
        }

        return await this.teamRoleRepository.create(dto);
    }

    async updateTeamRole(id: string, dto: UpdateTeamRoleDto): Promise<any> {
        const teamRole = await this.teamRoleRepository.findById(id);
        if (!teamRole) {
            throw new NotFoundException(`Team role with ID ${id} not found`);
        }

        if (dto.name) {
            const existingRole = await this.teamRoleRepository.findByNameAndTeam(dto.name, teamRole.teamId);
            if (existingRole && existingRole.id !== id) {
                throw new BadRequestException('Role name already exists in this team.');
            }
        }

        const updatedRole = await this.teamRoleRepository.update(id, dto);
        if (!updatedRole) {
            throw new NotFoundException(`Team role with ID ${id} could not be updated.`);
        }

        return updatedRole;
    }

    async deleteTeamRole(id: string): Promise<void> {
        const deleted = await this.teamRoleRepository.delete(id);
        if (!deleted) {
            throw new NotFoundException(`Team role with ID ${id} not found`);
        }
    }
}