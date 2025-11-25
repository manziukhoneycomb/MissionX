import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    private readonly logger = new Logger(TeamCommands.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    async create(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        this.logger.log(`Creating team "${dto.name}" for tenant ${tenantId}`);

        const team = await this.teamRepository.create(dto.name, dto.description, tenantId);

        return TeamDto.fromEntity(team);
    }

    async update(id: string, dto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        this.logger.log(`Updating team ${id} for tenant ${tenantId}`);

        const existingTeam = await this.teamRepository.findById(id);

        if (!existingTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (existingTeam.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to team from different tenant');
        }

        const updatedTeam = await this.teamRepository.update(id, dto.name, dto.description);

        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        return TeamDto.fromEntity(updatedTeam);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        this.logger.log(`Deleting team ${id} for tenant ${tenantId}`);

        const existingTeam = await this.teamRepository.findById(id);

        if (!existingTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (existingTeam.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to team from different tenant');
        }

        const deleted = await this.teamRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        this.logger.log(`Adding user ${userId} to team ${teamId} for tenant ${tenantId}`);

        const existingTeam = await this.teamRepository.findById(teamId);

        if (!existingTeam) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (existingTeam.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to team from different tenant');
        }

        await this.teamRepository.addMember(teamId, userId);
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        this.logger.log(`Removing user ${userId} from team ${teamId} for tenant ${tenantId}`);

        const existingTeam = await this.teamRepository.findById(teamId);

        if (!existingTeam) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (existingTeam.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to team from different tenant');
        }

        await this.teamRepository.removeMember(teamId, userId);
    }
}
