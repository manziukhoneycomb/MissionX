import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';
import { UserDto } from '../users/dto/user.dto';
import { RoleDto } from '../roles/dto/role.dto';

@Injectable()
export class TeamCommands implements ITeamCommands {
    private readonly logger = new Logger(TeamCommands.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    private mapToDto(team: Team | null): TeamDto | null {
        if (!team) {
            return null;
        }

        const dto = new TeamDto();

        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.tenant) {
            dto.tenant = { id: team.tenant.id, name: team.tenant.name } as Pick<
                TenantDto,
                'id' | 'name'
            >;
        }

        if (team.users) {
            dto.users = team.users.map((user) => {
                const userDto = new UserDto();
                userDto.id = user.id;
                userDto.email = user.email;
                userDto.firstName = user.firstName;
                userDto.lastName = user.lastName;
                userDto.isActive = user.isActive;
                userDto.createdAt = user.createdAt;
                userDto.updatedAt = user.updatedAt;
                
                if (user.roles) {
                    userDto.roles = user.roles.map((role) => {
                        const roleDto = new RoleDto();
                        roleDto.id = role.id;
                        roleDto.name = role.name;
                        return roleDto;
                    });
                } else {
                    userDto.roles = [];
                }

                return userDto;
            });
        } else {
            dto.users = [];
        }

        return dto;
    }

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        try {
            const team = await this.teamRepository.create({
                ...dto,
                tenantId,
            });

            this.logger.log(`Created team ${team.id} for tenant ${tenantId}`);

            const teamDto = this.mapToDto(team);

            if (!teamDto) {
                this.logger.error(`Failed to map team ID ${team.id} to DTO after creation.`);
                throw new InternalServerErrorException('Failed to map created team.');
            }

            return teamDto;
        } catch (error: unknown) {
            this.logger.error(`Failed to create team for tenant ${tenantId}`, error);
            throw new InternalServerErrorException('Team creation failed.');
        }
    }

    async updateTeam(id: string, dto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        const existingTeam = await this.teamRepository.findById(id);

        if (!existingTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (existingTeam.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot update team from different tenant.');
        }

        const updatedTeam = await this.teamRepository.update(id, dto);

        if (!updatedTeam) {
            this.logger.error(`Team update for ID ${id} returned null from repository.`);
            throw new InternalServerErrorException('Team update failed unexpectedly.');
        }

        const updatedDto = this.mapToDto(updatedTeam);

        if (!updatedDto) {
            this.logger.error(`Failed to map updated team ID ${id} to DTO.`);
            throw new InternalServerErrorException('Failed to map updated team.');
        }

        this.logger.log(`Updated team ${id} for tenant ${tenantId}`);
        return updatedDto;
    }

    async deleteTeam(id: string, tenantId: string): Promise<void> {
        const teamToDelete = await this.teamRepository.findById(id);

        if (!teamToDelete) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (teamToDelete.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot delete team from different tenant.');
        }

        const deleted = await this.teamRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(
                `Team with ID ${id} could not be deleted, potentially already deleted.`,
            );
        }

        this.logger.log(`Successfully deleted team ID: ${id} from tenant ${tenantId}`);
    }

    async addMemberToTeam(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot modify team from different tenant.');
        }

        await this.teamRepository.addMember(teamId, userId);
        this.logger.log(`Added user ${userId} to team ${teamId} in tenant ${tenantId}`);
    }

    async removeMemberFromTeam(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot modify team from different tenant.');
        }

        await this.teamRepository.removeMember(teamId, userId);
        this.logger.log(`Removed user ${userId} from team ${teamId} in tenant ${tenantId}`);
    }
}