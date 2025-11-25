import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { User } from '../../../domain/entities/user.entity';
import { 
    ITeamRepository, 
    CreateTeamDto, 
    UpdateTeamDto 
} from '../../../application/repositories/team.repository.interface';

@Injectable()
export class TeamRepository implements ITeamRepository {
    private readonly logger = new Logger(TeamRepository.name);

    constructor(
        @InjectRepository(Team)
        private readonly ormRepository: Repository<Team>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findById(id: string): Promise<Team | null> {
        return this.ormRepository.findOne({ 
            where: { id }, 
            relations: ['tenant', 'users'] 
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({ 
            where: { tenantId }, 
            relations: ['users']
        });
    }

    async create(dto: CreateTeamDto): Promise<Team> {
        const team = this.ormRepository.create(dto);
        return await this.ormRepository.save(team);
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
        const team = await this.findById(id);

        if (!team) {
            this.logger.warn(`Team with ID ${id} not found for update.`);
            return null;
        }

        this.ormRepository.merge(team, dto);
        return await this.ormRepository.save(team);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async addMember(teamId: string, userId: string): Promise<void> {
        const team = await this.ormRepository.findOne({ 
            where: { id: teamId }, 
            relations: ['users', 'tenant'] 
        });
        
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const user = await this.userRepository.findOne({ 
            where: { id: userId },
            relations: ['tenant']
        });
        
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (user.tenantId !== team.tenantId) {
            throw new BadRequestException('User and team must belong to the same tenant');
        }

        const isAlreadyMember = team.users.some(existingUser => existingUser.id === userId);
        if (isAlreadyMember) {
            this.logger.warn(`User ${userId} is already a member of team ${teamId}`);
            return;
        }

        team.users.push(user);
        await this.ormRepository.save(team);
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        const team = await this.ormRepository.findOne({ 
            where: { id: teamId }, 
            relations: ['users'] 
        });
        
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        team.users = team.users.filter(user => user.id !== userId);
        await this.ormRepository.save(team);
    }

    async findTeamMembers(teamId: string): Promise<Team | null> {
        return this.ormRepository.findOne({ 
            where: { id: teamId }, 
            relations: ['users', 'users.roles']
        });
    }
}