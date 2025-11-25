import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';
import { UserDto } from '../users/dto/user.dto';

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

        if (team.members) {
            dto.members = team.members.map((member) => ({
                id: member.id,
                email: member.email,
                firstName: member.firstName,
                lastName: member.lastName,
            }));
        } else {
            dto.members = [];
        }

        return dto;
    }

    async createTeam(dto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const createdTeam = await this.teamRepository.create(dto.name, dto.description, tenantId);

        const teamDto = this.mapToDto(createdTeam);

        if (!teamDto) {
            this.logger.error(`Failed to map team ID ${createdTeam.id} to DTO after creation.`);
            throw new InternalServerErrorException('Failed to map created team.');
        }

        return teamDto;
    }

    async updateTeam(id: string, dto: UpdateTeamDto, tenantId?: string): Promise<TeamDto> {
        const teamToUpdate = await this.teamRepository.findById(id, tenantId);

        if (!teamToUpdate) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (tenantId !== undefined && teamToUpdate.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot update team from different tenant.');
        }

        const updatedTeam = await this.teamRepository.update(id, dto.name, dto.description);

        if (!updatedTeam) {
            this.logger.error(`Team update for ID ${id} returned null from repository.`);
            throw new InternalServerErrorException('Team update failed unexpectedly.');
        }

        const updatedDto = this.mapToDto(updatedTeam);

        if (!updatedDto) {
            this.logger.error(`Failed to map updated team ID ${id} to DTO.`);
            throw new InternalServerErrorException('Failed to map updated team.');
        }

        return updatedDto;
    }

    async deleteTeam(id: string, tenantId?: string): Promise<void> {
        const teamToDelete = await this.teamRepository.findById(id, tenantId);

        if (!teamToDelete) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (tenantId !== undefined && teamToDelete.tenantId !== tenantId) {
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

    async addMember(teamId: string, userId: string, tenantId?: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (tenantId !== undefined && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot add member to team from different tenant.');
        }

        await this.teamRepository.addMember(teamId, userId);

        this.logger.log(`Successfully added user ${userId} to team ${teamId}`);
    }

    async removeMember(teamId: string, userId: string, tenantId?: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (tenantId !== undefined && team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot remove member from team from different tenant.');
        }

        await this.teamRepository.removeMember(teamId, userId);

        this.logger.log(`Successfully removed user ${userId} from team ${teamId}`);
    }
}
