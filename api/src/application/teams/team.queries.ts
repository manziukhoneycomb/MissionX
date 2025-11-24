import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto } from './dto/team.dto';
import { UserDto } from '../users/dto/user.dto';
import { TeamMapper } from './team.mapper';
import { UserMapper } from '../users/user.mapper';
import { extractErrorInfo } from '../../domain/utils/error.utils';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly teamMapper: TeamMapper,
        private readonly userMapper: UserMapper,
    ) {}

    async findAllTeamsByTenant(tenantId: string): Promise<TeamDto[]> {
        try {
            const teams = await this.teamRepository.findAllByTenantId(tenantId);
            return this.teamMapper.toDtoList(teams);
        } catch (error) {
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to find teams by tenant ${tenantId}: ${message}`, stack);
            throw error;
        }
    }

    async findAllTeams(): Promise<TeamDto[]> {
        try {
            const teams = await this.teamRepository.findAll();
            return this.teamMapper.toDtoList(teams);
        } catch (error) {
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to find all teams: ${message}`, stack);
            throw error;
        }
    }

    async findTeamById(id: string, requestingUserTenantId?: string): Promise<TeamDto> {
        try {
            const team = await this.teamRepository.findById(id);
            if (!team) {
                throw new NotFoundException('Team not found');
            }

            if (requestingUserTenantId && team.tenantId !== requestingUserTenantId) {
                throw new ForbiddenException('You can only view teams in your tenant');
            }

            return this.teamMapper.toDto(team);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to find team ${id}: ${message}`, stack);
            throw error;
        }
    }

    async getTeamUsers(teamId: string, requestingUserTenantId?: string): Promise<UserDto[]> {
        try {
            const team = await this.teamRepository.findById(teamId);
            if (!team) {
                throw new NotFoundException('Team not found');
            }

            if (requestingUserTenantId && team.tenantId !== requestingUserTenantId) {
                throw new ForbiddenException('You can only view teams in your tenant');
            }

            const users = await this.teamRepository.getTeamUsers(teamId);
            return this.userMapper.toDtoList(users);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            const { message, stack } = extractErrorInfo(error);
            this.logger.error(`Failed to get users for team ${teamId}: ${message}`, stack);
            throw error;
        }
    }
}