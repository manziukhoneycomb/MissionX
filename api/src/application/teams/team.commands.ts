import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team-response.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
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

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const existingTeam = await this.teamRepository.findByTenantIdAndName(tenantId, dto.name);

        if (existingTeam) {
            throw new BadRequestException('Team name already exists in this tenant.');
        }

        const createdTeam = await this.teamRepository.create(dto, tenantId);

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

        const updatedTeam = await this.teamRepository.update(id, dto);

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

    async addTeamMember(teamId: string, dto: AddTeamMemberDto): Promise<void> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        await this.teamRepository.addMember(teamId, dto.userId, dto.roleId);
    }

    async removeTeamMember(teamId: string, userId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        await this.teamRepository.removeMember(teamId, userId);
    }
}
