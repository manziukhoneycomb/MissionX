import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { User } from '../../../domain/entities/user.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';

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
            relations: ['tenant', 'users', 'users.roles'] 
        });
    }

    async findByIdAndTenantId(id: string, tenantId: string): Promise<Team | null> {
        return this.ormRepository.findOne({ 
            where: { id, tenantId }, 
            relations: ['tenant', 'users', 'users.roles'] 
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({ 
            where: { tenantId }, 
            relations: ['tenant', 'users', 'users.roles'] 
        });
    }

    async findAll(): Promise<Team[]> {
        return this.ormRepository.find({ 
            relations: ['tenant', 'users', 'users.roles'] 
        });
    }

    async create(dto: CreateTeamDto, tenantId: string): Promise<Team> {
        const team = this.ormRepository.create({
            ...dto,
            tenantId,
        });

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

    async addUsersToTeam(teamId: string, userIds: string[]): Promise<Team> {
        const team = await this.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const users = await this.userRepository.find({
            where: { 
                id: In(userIds),
                tenantId: team.tenantId 
            },
        });

        if (users.length !== userIds.length) {
            const foundIds = users.map(u => u.id);
            const notFoundIds = userIds.filter(id => !foundIds.includes(id));
            this.logger.warn(`Users not found in tenant: ${notFoundIds.join(', ')}`);
        }

        const existingUserIds = team.users.map(u => u.id);
        const newUsers = users.filter(u => !existingUserIds.includes(u.id));
        
        team.users = [...team.users, ...newUsers];
        return await this.ormRepository.save(team);
    }

    async removeUsersFromTeam(teamId: string, userIds: string[]): Promise<Team> {
        const team = await this.findById(teamId);
        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        team.users = team.users.filter(u => !userIds.includes(u.id));
        return await this.ormRepository.save(team);
    }
}