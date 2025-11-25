import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
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

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        this.logger.log(`Creating team "${dto.name}" for tenant ${tenantId}`);

        const team = await this.teamRepository.create(dto.name, dto.description, tenantId);

        return TeamDto.fromEntity(team);
    }

    async updateTeam(id: string, dto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        this.logger.log(`Updating team ${id} for tenant ${tenantId}`);

        const team = await this.teamRepository.update(id, tenantId, dto.name, dto.description);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        return TeamDto.fromEntity(team);
    }

    async deleteTeam(id: string, tenantId: string): Promise<void> {
        this.logger.log(`Deleting team ${id} for tenant ${tenantId}`);

        const deleted = await this.teamRepository.delete(id, tenantId);

        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        this.logger.log(`Adding user ${userId} to team ${teamId} for tenant ${tenantId}`);

        await this.teamRepository.addMember(teamId, userId, tenantId);
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        this.logger.log(`Removing user ${userId} from team ${teamId} for tenant ${tenantId}`);

        await this.teamRepository.removeMember(teamId, userId, tenantId);
    }
}
