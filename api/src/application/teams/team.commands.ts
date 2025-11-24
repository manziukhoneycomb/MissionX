import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ManageTeamUsersDto } from './dto/manage-team-users.dto';
import { TeamDto } from './dto/team.dto';
import { TeamMapper } from './team.mapper';

@Injectable()
export class TeamCommands implements ITeamCommands {
    private readonly logger = new Logger(TeamCommands.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TeamMapper)
        private readonly teamMapper: TeamMapper,
    ) {}

    private validateTeamAccess(
        team: Team,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): void {
        if (isSuperAdmin) {
            return;
        }

        if (!requestingUserTenantId || team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Access denied to this team');
        }
    }

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create(dto, tenantId);
        return this.teamMapper.toDto(team);
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

        this.validateTeamAccess(team, requestingUserTenantId, isSuperAdmin);

        const updatedTeam = await this.teamRepository.update(id, dto);
        if (!updatedTeam) {
            throw new NotFoundException('Team not found');
        }

        return this.teamMapper.toDto(updatedTeam);
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

        this.validateTeamAccess(team, requestingUserTenantId, isSuperAdmin);

        const deleted = await this.teamRepository.delete(id);
        if (!deleted) {
            throw new NotFoundException('Team not found');
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

        this.validateTeamAccess(team, requestingUserTenantId, isSuperAdmin);

        try {
            const updatedTeam = await this.teamRepository.addUsers(teamId, dto.userIds);
            return this.teamMapper.toDto(updatedTeam);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Some users not found')) {
                throw new NotFoundException(error.message);
            }
            throw error;
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

        this.validateTeamAccess(team, requestingUserTenantId, isSuperAdmin);

        const updatedTeam = await this.teamRepository.removeUsers(teamId, dto.userIds);
        return this.teamMapper.toDto(updatedTeam);
    }
}
