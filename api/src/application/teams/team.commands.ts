import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto, CreateTeamBySuperAdminDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ManageTeamUsersDto } from './dto/manage-team-users.dto';
import { TeamDto } from './dto/team.dto';
import { TeamMapper } from './team.mapper';
import { extractErrorInfo } from '../../domain/utils/error.utils';

@Injectable()
export class TeamCommands implements ITeamCommands {
    private readonly logger = new Logger(TeamCommands.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        private readonly teamMapper: TeamMapper,
    ) {}

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        try {
            const team = await this.teamRepository.create(dto, tenantId);
            return this.teamMapper.toDto(team);
        } catch (error) {
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to create team: ${message}`, stack);
            throw new BadRequestException('Failed to create team');
        }
    }

    async createTeamBySuperAdmin(dto: CreateTeamBySuperAdminDto): Promise<TeamDto> {
        try {
            const team = await this.teamRepository.create(dto, dto.tenantId);
            return this.teamMapper.toDto(team);
        } catch (error) {
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to create team by super admin: ${message}`, stack);
            throw new BadRequestException('Failed to create team');
        }
    }

    async updateTeam(
        id: string,
        dto: UpdateTeamDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (!isSuperAdmin && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('You can only update teams in your tenant');
        }

        try {
            const updatedTeam = await this.teamRepository.update(id, dto);
            if (!updatedTeam) {
                throw new NotFoundException('Team not found');
            }
            return this.teamMapper.toDto(updatedTeam);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to update team ${id}: ${message}`, stack);
            throw new BadRequestException('Failed to update team');
        }
    }

    async deleteTeam(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void> {
        const team = await this.teamRepository.findById(id);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (!isSuperAdmin && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('You can only delete teams in your tenant');
        }

        try {
            const deleted = await this.teamRepository.delete(id);
            if (!deleted) {
                throw new NotFoundException('Team not found');
            }
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to delete team ${id}: ${message}`, stack);
            throw new BadRequestException('Failed to delete team');
        }
    }

    async addUsersToTeam(
        teamId: string,
        dto: ManageTeamUsersDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (!isSuperAdmin && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('You can only manage teams in your tenant');
        }

        try {
            const updatedTeam = await this.teamRepository.addUsersToTeam(teamId, dto.userIds);
            if (!updatedTeam) {
                throw new NotFoundException('Team not found');
            }
            return this.teamMapper.toDto(updatedTeam);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to add users to team ${teamId}: ${message}`, stack);
            throw new BadRequestException('Failed to add users to team');
        }
    }

    async removeUsersFromTeam(
        teamId: string,
        dto: ManageTeamUsersDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (!isSuperAdmin && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('You can only manage teams in your tenant');
        }

        try {
            const updatedTeam = await this.teamRepository.removeUsersFromTeam(teamId, dto.userIds);
            if (!updatedTeam) {
                throw new NotFoundException('Team not found');
            }
            return this.teamMapper.toDto(updatedTeam);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to remove users from team ${teamId}: ${message}`, stack);
            throw new BadRequestException('Failed to remove users from team');
        }
    }
}