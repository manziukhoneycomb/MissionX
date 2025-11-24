import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { User } from '../../../domain/entities/user.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import {
    CreateTeamDto,
    CreateTeamBySuperAdminDto,
} from '../../../application/teams/dto/create-team.dto';
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
            relations: ['tenant', 'users'],
            order: { createdAt: 'DESC' }
        });
    }

    async findAll(): Promise<Team[]> {
        return this.ormRepository.find({ 
            relations: ['tenant', 'users'],
            order: { createdAt: 'DESC' }
        });
    }

    async create(
        dto: CreateTeamDto | CreateTeamBySuperAdminDto,
        tenantId: string,
    ): Promise<Team> {
        const team = this.ormRepository.create({
            name: dto.name,
            description: dto.description,
            tenantId,
        });

        if (dto.userIds && dto.userIds.length > 0) {
            const users = await this.userRepository.findBy({
                id: In(dto.userIds),
                tenantId,
            });
            team.users = users;
        } else {
            team.users = [];
        }

        return this.ormRepository.save(team);
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
        const team = await this.findById(id);
        if (!team) {
            return null;
        }

        if (dto.name !== undefined) {
            team.name = dto.name;
        }
        
        if (dto.description !== undefined) {
            team.description = dto.description;
        }

        return this.ormRepository.save(team);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return result.affected !== 0;
    }

    async addUsersToTeam(teamId: string, userIds: string[]): Promise<Team | null> {
        const team = await this.findById(teamId);
        if (!team) {
            return null;
        }

        const usersToAdd = await this.userRepository.findBy({
            id: In(userIds),
            tenantId: team.tenantId,
        });

        const existingUserIds = new Set(team.users.map(user => user.id));
        const newUsers = usersToAdd.filter(user => !existingUserIds.has(user.id));
        
        team.users = [...team.users, ...newUsers];
        return this.ormRepository.save(team);
    }

    async removeUsersFromTeam(teamId: string, userIds: string[]): Promise<Team | null> {
        const team = await this.findById(teamId);
        if (!team) {
            return null;
        }

        const userIdsToRemove = new Set(userIds);
        team.users = team.users.filter(user => !userIdsToRemove.has(user.id));
        
        return this.ormRepository.save(team);
    }

    async getTeamUsers(teamId: string): Promise<User[]> {
        const team = await this.findById(teamId);
        return team ? team.users : [];
    }
}