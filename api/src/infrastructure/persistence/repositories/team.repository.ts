import { Injectable, Logger } from '@nestjs/common';
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
            relations: ['tenant', 'users'] 
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({ 
            where: { tenantId }, 
            relations: ['tenant', 'users'] 
        });
    }

    async findAll(): Promise<Team[]> {
        return this.ormRepository.find({ 
            relations: ['tenant', 'users'] 
        });
    }

    async create(dto: CreateTeamDto, tenantId: string): Promise<Team> {
        const team = this.ormRepository.create({
            ...dto,
            tenantId,
            users: [],
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

    async updateTeamUsers(teamId: string, userIds: string[]): Promise<Team | null> {
        const team = await this.findById(teamId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for user update.`);
            return null;
        }

        if (userIds.length > 0) {
            const users = await this.userRepository.find({ 
                where: { 
                    id: In(userIds),
                    tenantId: team.tenantId,
                } 
            });

            if (users.length !== userIds.length) {
                const foundIds = users.map(u => u.id);
                const notFoundIds = userIds.filter(id => !foundIds.includes(id));
                this.logger.warn(
                    `UpdateTeamUsers: Could not find all users for IDs: ${notFoundIds.join(', ')} in tenant ${team.tenantId}`,
                );
            }

            team.users = users;
        } else {
            team.users = [];
        }

        return await this.ormRepository.save(team);
    }
}