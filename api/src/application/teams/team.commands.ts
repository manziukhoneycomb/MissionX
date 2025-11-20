import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { RoleName } from '../../domain/enums/role-name.enum';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto, TeamMemberDto } from './dto/team-response.dto';
import { AddTeamMemberDto, UpdateTeamMemberRoleDto } from './dto/add-team-member.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    private readonly logger = new Logger(TeamCommands.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    private mapTeamToDto(team: Team): TeamResponseDto {
        const dto = new TeamResponseDto();

        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.tenant) {
            dto.tenant = {
                id: team.tenant.id,
                name: team.tenant.name,
            };
        }

        if (team.teamMembers) {
            dto.teamMembers = team.teamMembers.map((member) => this.mapTeamMemberToDto(member));
        }

        return dto;
    }

    private mapTeamMemberToDto(teamMember: TeamMember): TeamMemberDto {
        const dto = new TeamMemberDto();

        dto.id = teamMember.id;
        dto.userId = teamMember.userId;
        dto.role = teamMember.role;
        dto.joinedAt = teamMember.joinedAt;

        if (teamMember.user) {
            dto.user = {
                id: teamMember.user.id,
                email: teamMember.user.email,
                firstName: teamMember.user.firstName,
                lastName: teamMember.user.lastName,
            };
        }

        return dto;
    }

    private async validateTeamAccess(
        teamId: string,
        tenantId: string,
        requestingUserId: string,
        requiredRoles: RoleName[] = [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN],
    ): Promise<{ team: Team; member: TeamMember }> {
        const team = await this.teamRepository.findByIdAndTenant(teamId, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const member = await this.teamRepository.findTeamMember(teamId, requestingUserId);

        if (!member || !requiredRoles.includes(member.role)) {
            throw new ForbiddenException('Insufficient permissions to perform this action');
        }

        return { team, member };
    }

    async createTeam(
        dto: CreateTeamDto,
        tenantId: string,
        ownerId: string,
    ): Promise<TeamResponseDto> {
        const user = await this.userRepository.findById(ownerId);

        if (!user || user.tenantId !== tenantId) {
            throw new BadRequestException('Invalid user or tenant mismatch');
        }

        try {
            const team = await this.teamRepository.create(dto, tenantId, ownerId);
            return this.mapTeamToDto(team);
        } catch (error) {
            this.logger.error(`Failed to create team: ${error}`);
            throw new InternalServerErrorException('Failed to create team');
        }
    }

    async updateTeam(
        id: string,
        dto: UpdateTeamDto,
        tenantId: string,
        requestingUserId: string,
    ): Promise<TeamResponseDto> {
        await this.validateTeamAccess(id, tenantId, requestingUserId);

        const updatedTeam = await this.teamRepository.update(id, dto);

        if (!updatedTeam) {
            this.logger.error(`Team update for ID ${id} returned null from repository.`);
            throw new InternalServerErrorException('Team update failed unexpectedly.');
        }

        return this.mapTeamToDto(updatedTeam);
    }

    async deleteTeam(id: string, tenantId: string, requestingUserId: string): Promise<void> {
        await this.validateTeamAccess(id, tenantId, requestingUserId, [RoleName.TEAM_OWNER]);

        const deleted = await this.teamRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(`Team with ID ${id} could not be deleted`);
        }

        this.logger.log(`Successfully deleted team ID: ${id}`);
    }

    async addTeamMember(
        teamId: string,
        dto: AddTeamMemberDto,
        tenantId: string,
        requestingUserId: string,
    ): Promise<void> {
        await this.validateTeamAccess(teamId, tenantId, requestingUserId);

        const userToAdd = await this.userRepository.findById(dto.userId);

        if (!userToAdd || userToAdd.tenantId !== tenantId) {
            throw new BadRequestException('User not found or not in the same tenant');
        }

        const teamRoles = [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER];
        if (!teamRoles.includes(dto.role)) {
            throw new BadRequestException('Invalid team role specified');
        }

        try {
            await this.teamRepository.addTeamMember(teamId, dto);
            this.logger.log(`Added user ${dto.userId} to team ${teamId} with role ${dto.role}`);
        } catch (error) {
            this.logger.error(`Failed to add team member: ${error}`);
            throw new BadRequestException('Failed to add team member');
        }
    }

    async removeTeamMember(
        teamId: string,
        memberId: string,
        tenantId: string,
        requestingUserId: string,
    ): Promise<void> {
        await this.validateTeamAccess(teamId, tenantId, requestingUserId);

        const member = await this.teamRepository.findTeamMemberById(memberId);

        if (!member || member.teamId !== teamId) {
            throw new NotFoundException('Team member not found');
        }

        if (member.role === RoleName.TEAM_OWNER) {
            const allMembers = await this.teamRepository.findTeamMembers(teamId);
            const owners = allMembers.filter((m) => m.role === RoleName.TEAM_OWNER);

            if (owners.length === 1) {
                throw new BadRequestException(
                    'Cannot remove the last team owner. Transfer ownership first or delete the team.',
                );
            }
        }

        const removed = await this.teamRepository.removeTeamMember(teamId, memberId);

        if (!removed) {
            throw new NotFoundException('Team member could not be removed');
        }

        this.logger.log(`Removed team member ${memberId} from team ${teamId}`);
    }

    async updateTeamMemberRole(
        teamId: string,
        memberId: string,
        dto: UpdateTeamMemberRoleDto,
        tenantId: string,
        requestingUserId: string,
    ): Promise<void> {
        await this.validateTeamAccess(teamId, tenantId, requestingUserId, [RoleName.TEAM_OWNER]);

        const member = await this.teamRepository.findTeamMemberById(memberId);

        if (!member || member.teamId !== teamId) {
            throw new NotFoundException('Team member not found');
        }

        if (member.role === RoleName.TEAM_OWNER && dto.role !== RoleName.TEAM_OWNER) {
            const allMembers = await this.teamRepository.findTeamMembers(teamId);
            const owners = allMembers.filter((m) => m.role === RoleName.TEAM_OWNER);

            if (owners.length === 1) {
                throw new BadRequestException(
                    'Cannot change role of the last team owner. Assign another owner first.',
                );
            }
        }

        const teamRoles = [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER];
        if (!teamRoles.includes(dto.role)) {
            throw new BadRequestException('Invalid team role specified');
        }

        const updatedMember = await this.teamRepository.updateTeamMemberRole(memberId, dto.role);

        if (!updatedMember) {
            throw new InternalServerErrorException('Failed to update team member role');
        }

        this.logger.log(`Updated role of team member ${memberId} to ${dto.role}`);
    }
}
