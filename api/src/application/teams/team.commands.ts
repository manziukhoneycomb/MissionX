import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { TeamMapper } from './team.mapper';

@Injectable()
export class TeamCommands implements ITeamCommands {
    private readonly logger = new Logger(TeamCommands.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        private readonly teamMapper: TeamMapper,
    ) {}

    async create(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create(dto, tenantId);
        this.logger.log(`Created team ${team.id} for tenant ${tenantId}`);
        return this.teamMapper.toDto(team);
    }

    async update(
        id: string,
        dto: UpdateTeamDto,
        tenantId: string,
        isSuperAdmin: boolean
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (!isSuperAdmin && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot update team from different tenant');
        }

        const updatedTeam = await this.teamRepository.update(id, dto);
        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        this.logger.log(`Updated team ${id}`);
        return this.teamMapper.toDto(updatedTeam);
    }

    async delete(
        id: string,
        tenantId: string,
        isSuperAdmin: boolean
    ): Promise<void> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (!isSuperAdmin && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot delete team from different tenant');
        }

        const deleted = await this.teamRepository.delete(id);
        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        this.logger.log(`Deleted team ${id}`);
    }

    async addUsersToTeam(
        teamId: string,
        userIds: string[],
        tenantId: string,
        isSuperAdmin: boolean
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (!isSuperAdmin && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot modify team from different tenant');
        }

        const updatedTeam = await this.teamRepository.addUsersToTeam(teamId, userIds);
        this.logger.log(`Added ${userIds.length} users to team ${teamId}`);
        return this.teamMapper.toDto(updatedTeam);
    }

    async removeUsersFromTeam(
        teamId: string,
        userIds: string[],
        tenantId: string,
        isSuperAdmin: boolean
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (!isSuperAdmin && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot modify team from different tenant');
        }

        const updatedTeam = await this.teamRepository.removeUsersFromTeam(teamId, userIds);
        this.logger.log(`Removed ${userIds.length} users from team ${teamId}`);
        return this.teamMapper.toDto(updatedTeam);
    }
}