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
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';
import { UserDto } from '../users/dto/user.dto';
import { RoleDto } from '../roles/dto/role.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

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

    async findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        try {
            const teams = await this.teamRepository.findAllByTenantId(tenantId);
            return teams.map(team => this.mapToDto(team)).filter(dto => dto !== null) as TeamDto[];
        } catch (error: unknown) {
            this.logger.error(`Failed to find teams for tenant ${tenantId}`, error);
            throw new InternalServerErrorException('Failed to retrieve teams.');
        }
    }

    async findTeamById(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot access team from different tenant.');
        }

        const teamDto = this.mapToDto(team);

        if (!teamDto) {
            this.logger.error(`Failed to map team ID ${id} to DTO.`);
            throw new InternalServerErrorException('Failed to map team.');
        }

        return teamDto;
    }

    async findTeamMembers(teamId: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findTeamMembers(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Cannot access team from different tenant.');
        }

        const teamDto = this.mapToDto(team);

        if (!teamDto) {
            this.logger.error(`Failed to map team ID ${teamId} with members to DTO.`);
            throw new InternalServerErrorException('Failed to map team with members.');
        }

        return teamDto;
    }
}