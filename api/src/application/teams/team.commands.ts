import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITenantRepository, TENANT_REPOSITORY } from '../repositories/tenant.repository.interface';
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
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: ITenantRepository,
        private readonly teamMapper: TeamMapper,
    ) {}

    private async checkTeamAccess(
        teamId: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (!isSuperAdmin && team.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('You do not have permission to access this team');
        }
    }

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create(dto, tenantId);

        this.logger.log(`Successfully created team ${team.id} for tenant ${tenantId}`);

        return this.teamMapper.mapToDto(team) as TeamDto;
    }

    async createTeamBySuperAdmin(dto: CreateTeamDto): Promise<TeamDto> {
        if (!dto.tenantId) {
            throw new BadRequestException('Tenant ID is required for super admin team creation');
        }

        const tenant = await this.tenantRepository.findById(dto.tenantId);
        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${dto.tenantId} not found`);
        }

        const team = await this.teamRepository.create(dto, dto.tenantId);

        this.logger.log(`Super admin created team ${team.id} for tenant ${dto.tenantId}`);

        return this.teamMapper.mapToDto(team) as TeamDto;
    }

    async updateTeam(
        id: string,
        dto: UpdateTeamDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto> {
        await this.checkTeamAccess(id, requestingUserTenantId, isSuperAdmin);

        const updatedTeam = await this.teamRepository.update(id, dto);

        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        this.logger.log(`Successfully updated team ${id}`);

        return this.teamMapper.mapToDto(updatedTeam) as TeamDto;
    }

    async deleteTeam(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void> {
        await this.checkTeamAccess(id, requestingUserTenantId, isSuperAdmin);

        const deleted = await this.teamRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        this.logger.log(`Successfully deleted team ${id}`);
    }

    async updateTeamUsers(
        id: string,
        dto: ManageTeamUsersDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TeamDto> {
        await this.checkTeamAccess(id, requestingUserTenantId, isSuperAdmin);

        const updatedTeam = await this.teamRepository.updateTeamUsers(id, dto.userIds);

        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        this.logger.log(`Successfully updated users for team ${id}`);

        return this.teamMapper.mapToDto(updatedTeam) as TeamDto;
    }
}