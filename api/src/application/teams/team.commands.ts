import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamDto } from './dto/team.dto';
import { TeamMemberDto } from './dto/team-member.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    private mapTeamToDto(team: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.isActive = team.isActive;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.teamMembers) {
            dto.members = team.teamMembers.map((member) => this.mapTeamMemberToDto(member));
        }

        return dto;
    }

    private mapTeamMemberToDto(member: TeamMember): TeamMemberDto {
        const dto = new TeamMemberDto();
        dto.id = member.id;
        dto.teamId = member.teamId;
        dto.userId = member.userId;
        dto.teamRoleId = member.teamRoleId;
        dto.isActive = member.isActive;
        dto.createdAt = member.createdAt;
        dto.updatedAt = member.updatedAt;

        if (member.user) {
            dto.user = {
                id: member.user.id,
                email: member.user.email,
                firstName: member.user.firstName,
                lastName: member.user.lastName,
            };
        }

        if (member.teamRole) {
            dto.teamRole = {
                id: member.teamRole.id,
                name: member.teamRole.name,
                description: member.teamRole.description,
            };
        }

        return dto;
    }

    async createTeam(dto: CreateTeamDto): Promise<TeamDto> {
        const createdTeam = await this.teamRepository.create(dto);
        return this.mapTeamToDto(createdTeam);
    }

    async updateTeam(id: string, dto: UpdateTeamDto): Promise<TeamDto> {
        if (Object.keys(dto).length === 0) {
            const team = await this.teamRepository.findById(id);
            if (!team) {
                throw new NotFoundException(`Team with ID ${id} not found`);
            }
            return this.mapTeamToDto(team);
        }

        const updatedTeam = await this.teamRepository.update(id, dto);
        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found or could not be updated`);
        }

        return this.mapTeamToDto(updatedTeam);
    }

    async deleteTeam(id: string): Promise<void> {
        const deleted = await this.teamRepository.delete(id);
        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async addTeamMember(dto: AddTeamMemberDto): Promise<TeamMemberDto> {
        const existingMembers = await this.teamRepository.getMembersByTeam(dto.teamId);
        const isAlreadyMember = existingMembers.some(
            (member) => member.userId === dto.userId && member.isActive,
        );

        if (isAlreadyMember) {
            throw new BadRequestException('User is already a member of this team');
        }

        const member = await this.teamRepository.addMember(dto);
        return this.mapTeamMemberToDto(member);
    }

    async removeTeamMember(teamId: string, userId: string): Promise<void> {
        const removed = await this.teamRepository.removeMember(teamId, userId);
        if (!removed) {
            throw new NotFoundException('Team member not found');
        }
    }

    async updateTeamMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberDto,
    ): Promise<TeamMemberDto> {
        const updatedMember = await this.teamRepository.updateMemberRole(teamId, userId, dto);
        if (!updatedMember) {
            throw new NotFoundException('Team member not found');
        }

        return this.mapTeamMemberToDto(updatedMember);
    }
}
