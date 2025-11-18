import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamRoleRepository, TEAM_ROLE_REPOSITORY } from '../repositories/team-role.repository.interface';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamRole } from '../../domain/entities/team-role.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TeamDto } from './dto/team.dto';
import { TeamMemberDto } from './dto/team-member.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TEAM_ROLE_REPOSITORY)
        private readonly teamRoleRepository: ITeamRoleRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    private mapToDto(team: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;
        return dto;
    }

    private mapTeamRoleToMemberDto(teamRole: TeamRole): TeamMemberDto {
        const dto = new TeamMemberDto();
        dto.id = teamRole.id;
        dto.teamId = teamRole.teamId;
        dto.userId = teamRole.userId;
        dto.role = teamRole.role;
        dto.createdAt = teamRole.createdAt;
        dto.updatedAt = teamRole.updatedAt;
        
        if (teamRole.user) {
            dto.email = teamRole.user.email;
            dto.firstName = teamRole.user.firstName;
            dto.lastName = teamRole.user.lastName;
            dto.isActive = teamRole.user.isActive;
        }
        
        return dto;
    }

    async createTeam(dto: CreateTeamDto): Promise<TeamDto> {
        const teamData: Partial<Team> = {
            name: dto.name,
            description: dto.description,
            tenantId: dto.tenantId,
        };

        const createdTeam = await this.teamRepository.create(teamData);
        return this.mapToDto(createdTeam);
    }

    async updateTeam(id: string, dto: UpdateTeamDto): Promise<TeamDto> {
        if (Object.keys(dto).length === 0) {
            const team = await this.teamRepository.findById(id);
            
            if (!team) {
                throw new NotFoundException(`Team with ID ${id} not found`);
            }
            
            return this.mapToDto(team);
        }

        const teamData: Partial<Team> = {
            name: dto.name,
            description: dto.description,
        };

        const updatedTeam = await this.teamRepository.update(id, teamData);

        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found or could not be updated.`);
        }

        return this.mapToDto(updatedTeam);
    }

    async deleteTeam(id: string): Promise<void> {
        const deleted = await this.teamRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async addTeamMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMemberDto> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${dto.userId} not found`);
        }

        if (user.tenantId !== team.tenantId) {
            throw new BadRequestException('User must belong to the same tenant as the team');
        }

        const existingMember = await this.teamRoleRepository.findByTeamAndUser(teamId, dto.userId);
        
        if (existingMember) {
            throw new BadRequestException('User is already a member of this team');
        }

        const teamRole = await this.teamRoleRepository.create(teamId, dto.userId, dto.role);
        return this.mapTeamRoleToMemberDto(teamRole);
    }

    async removeTeamMember(teamId: string, userId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const removed = await this.teamRoleRepository.delete(teamId, userId);
        
        if (!removed) {
            throw new NotFoundException(`User with ID ${userId} is not a member of team ${teamId}`);
        }
    }
}