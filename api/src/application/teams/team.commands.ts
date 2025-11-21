import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import {
    ITeamMemberRepository,
    TEAM_MEMBER_REPOSITORY,
} from '../repositories/team-member.repository.interface';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../repositories/role.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TeamResponseDto, TeamMemberResponseDto } from './dto/team-response.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    private readonly logger = new Logger(TeamCommands.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(TEAM_MEMBER_REPOSITORY)
        private readonly teamMemberRepository: ITeamMemberRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) {}

    private mapTeamToDto(team: Team): TeamResponseDto {
        const dto: TeamResponseDto = {
            id: team.id,
            name: team.name,
            description: team.description,
            tenant: { id: team.tenant?.id || team.tenantId, name: team.tenant?.name || '' } as Pick<
                TenantDto,
                'id' | 'name'
            >,
            memberCount: team.members?.length || 0,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };

        return dto;
    }

    private mapTeamMemberToDto(teamMember: TeamMember): TeamMemberResponseDto {
        const dto: TeamMemberResponseDto = {
            id: teamMember.id,
            user: {
                id: teamMember.user.id,
                email: teamMember.user.email,
                firstName: teamMember.user.firstName,
                lastName: teamMember.user.lastName,
            },
            role: {
                id: teamMember.role.id,
                name: teamMember.role.name,
            },
            joinedAt: teamMember.joinedAt,
        };

        return dto;
    }

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamResponseDto> {
        const existingTeam = await this.teamRepository.findByName(dto.name, tenantId);
        if (existingTeam) {
            throw new BadRequestException('Team with this name already exists in the tenant');
        }

        const createdTeam = await this.teamRepository.create(dto, tenantId);
        this.logger.log(`Created team ${createdTeam.id} for tenant ${tenantId}`);

        return this.mapTeamToDto(createdTeam);
    }

    async updateTeam(
        id: string,
        dto: UpdateTeamDto,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<TeamResponseDto> {
        const teamToUpdate = await this.teamRepository.findById(id);

        if (!teamToUpdate) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            teamToUpdate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot update team from different tenant.');
        }

        if (dto.name) {
            const existingTeam = await this.teamRepository.findByName(
                dto.name,
                teamToUpdate.tenantId,
            );
            if (existingTeam && existingTeam.id !== id) {
                throw new BadRequestException('Team with this name already exists in the tenant');
            }
        }

        const updatedTeam = await this.teamRepository.update(id, dto);

        if (!updatedTeam) {
            this.logger.error(`Team update for ID ${id} returned null from repository.`);
            throw new NotFoundException('Team update failed unexpectedly.');
        }

        this.logger.log(`Updated team ${id}`);

        return this.mapTeamToDto(updatedTeam);
    }

    async deleteTeam(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const teamToDelete = await this.teamRepository.findById(id);

        if (!teamToDelete) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            teamToDelete.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot delete team from different tenant.');
        }

        const deleted = await this.teamRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(
                `Team with ID ${id} could not be deleted, potentially already deleted.`,
            );
        }

        this.logger.log(`Successfully deleted team ID: ${id}`);
    }

    async addTeamMember(
        teamId: string,
        dto: AddTeamMemberDto,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<TeamMemberResponseDto> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            team.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot add member to team from different tenant.');
        }

        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${dto.userId} not found`);
        }

        if (!isSuperAdmin && user.tenantId !== team.tenantId) {
            throw new ForbiddenException('Cannot add user from different tenant to team.');
        }

        const role = await this.roleRepository.findById(dto.roleId);
        if (!role) {
            throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
        }

        const existingMember = await this.teamMemberRepository.findByTeamAndUserId(
            teamId,
            dto.userId,
        );
        if (existingMember) {
            throw new BadRequestException('User is already a member of this team');
        }

        const teamMember = await this.teamMemberRepository.addMember(teamId, {
            userId: dto.userId,
            roleId: dto.roleId,
        });

        this.logger.log(`Added user ${dto.userId} to team ${teamId}`);

        return this.mapTeamMemberToDto(teamMember);
    }

    async removeTeamMember(
        teamId: string,
        userId: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            team.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot remove member from team in different tenant.');
        }

        const existingMember = await this.teamMemberRepository.findByTeamAndUserId(teamId, userId);
        if (!existingMember) {
            throw new NotFoundException('User is not a member of this team');
        }

        const removed = await this.teamMemberRepository.removeMember(teamId, userId);

        if (!removed) {
            throw new NotFoundException(
                `Team member could not be removed, potentially already removed.`,
            );
        }

        this.logger.log(`Removed user ${userId} from team ${teamId}`);
    }
}
