import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto, TeamMemberDto } from './dto/team.dto';
import { ITeamsService } from './interfaces/teams.service.interface';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class TeamsService implements ITeamsService {
    private readonly logger = new Logger(TeamsService.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createTeamDto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.create({
            ...createTeamDto,
            tenantId,
        });

        return this.mapToDto(team);
    }

    async findAll(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map((team) => this.mapToDto(team));
    }

    async findOne(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            this.logger.warn(`Team with ID ${id} not found`);
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            this.logger.warn(
                `Access denied: Team ${id} belongs to tenant ${team.tenantId}, requested by tenant ${tenantId}`,
            );
            throw new ForbiddenException('Access denied to this team');
        }

        return this.mapToDto(team);
    }

    async update(id: string, updateTeamDto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            this.logger.warn(`Team with ID ${id} not found for update`);
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            this.logger.warn(
                `Access denied: Team ${id} belongs to tenant ${team.tenantId}, requested by tenant ${tenantId}`,
            );
            throw new ForbiddenException('Access denied to this team');
        }

        const updatedTeam = await this.teamRepository.update(id, updateTeamDto);
        return this.mapToDto(updatedTeam);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            this.logger.warn(`Team with ID ${id} not found for deletion`);
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            this.logger.warn(
                `Access denied: Team ${id} belongs to tenant ${team.tenantId}, requested by tenant ${tenantId}`,
            );
            throw new ForbiddenException('Access denied to this team');
        }

        await this.teamRepository.delete(id);
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for adding member`);
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (team.tenantId !== tenantId) {
            this.logger.warn(
                `Access denied: Team ${teamId} belongs to tenant ${team.tenantId}, requested by tenant ${tenantId}`,
            );
            throw new ForbiddenException('Access denied to this team');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for adding to team`);
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (user.tenantId !== tenantId) {
            this.logger.warn(
                `User ${userId} belongs to tenant ${user.tenantId}, cannot add to team in tenant ${tenantId}`,
            );
            throw new BadRequestException('User must belong to the same tenant as the team');
        }

        await this.teamRepository.addMember(teamId, userId);
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for removing member`);
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (team.tenantId !== tenantId) {
            this.logger.warn(
                `Access denied: Team ${teamId} belongs to tenant ${team.tenantId}, requested by tenant ${tenantId}`,
            );
            throw new ForbiddenException('Access denied to this team');
        }

        await this.teamRepository.removeMember(teamId, userId);
    }

    private mapToDto(team: Team): TeamDto {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            tenantId: team.tenantId,
            members: team.members?.map((member) => this.mapMemberToDto(member)),
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };
    }

    private mapMemberToDto(user: User): TeamMemberDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
}
