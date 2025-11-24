import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { ITeamRepository } from '../../repositories/team.repository.interface';
import { TEAM_REPOSITORY } from './teams.constants';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamDto } from './dto/team.dto';
import { Team } from '../../domain/entities/team.entity';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { IUserQueries } from '../users/interfaces/user-queries.interface';

// Assuming USER_QUERIES is defined in user constants or we use string token
const USER_QUERIES = 'USER_QUERIES';

@Injectable()
export class TeamsService {
    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
        @Inject(USER_QUERIES)
        private readonly userQueries: IUserQueries,
    ) {}

    private mapToDto(team: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        return dto;
    }

    async findAll(tenantId: string): Promise<TeamDto[]> {
        const teams = await this.teamRepository.findAllByTenantId(tenantId);
        return teams.map((team) => this.mapToDto(team));
    }

    async findById(id: string, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Access to this team is denied');
        }

        return this.mapToDto(team);
    }

    async create(createTeamDto: CreateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = new Team();
        team.name = createTeamDto.name;
        team.description = createTeamDto.description;
        team.tenantId = tenantId;

        const savedTeam = await this.teamRepository.create(team);
        return this.mapToDto(savedTeam);
    }

    async update(id: string, updateTeamDto: UpdateTeamDto, tenantId: string): Promise<TeamDto> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Access to this team is denied');
        }

        Object.assign(team, updateTeamDto);
        const updatedTeam = await this.teamRepository.save(team);
        return this.mapToDto(updatedTeam);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Access to this team is denied');
        }

        await this.teamRepository.delete(id);
    }

    async addMember(id: string, addTeamMemberDto: AddTeamMemberDto, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Access to this team is denied');
        }

        const user = await this.userQueries.findUserById(addTeamMemberDto.userId, tenantId);
        
        // findUserById with tenantId argument already checks for tenant isolation
        // If user not found or not in tenant, it throws.

        // TypeORM requires actual User entities for relation
        // We need to fetch the full user entity or construct a partial one if we are sure it exists
        // Since IUserQueries returns DTO, strictly speaking we should use repository to fetch entity
        // But for this implementation, we will trust the ID exists and assign it partialy or fetch it via repository if available.
        // However, Team.users is User[].
        
        // We can do this:
        const userEntity = new (await import('../../domain/entities/user.entity')).User();
        userEntity.id = user.id;

        if (!team.users) {
            team.users = [];
        }
        
        // Check if already member
        if (!team.users.some(u => u.id === userEntity.id)) {
            team.users.push(userEntity);
            await this.teamRepository.save(team);
        }
    }

    async removeMember(id: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Access to this team is denied');
        }

        if (team.users) {
            team.users = team.users.filter(u => u.id !== userId);
            await this.teamRepository.save(team);
        }
    }
}
