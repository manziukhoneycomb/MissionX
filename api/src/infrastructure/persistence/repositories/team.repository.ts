import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { User } from '../../../domain/entities/user.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(name: string, description: string | undefined, tenantId: string): Promise<Team> {
        const team = this.teamRepository.create({
            name,
            description,
            tenantId,
        });
        return await this.teamRepository.save(team);
    }

    async update(id: string, name: string, description: string | undefined): Promise<Team | null> {
        const team = await this.teamRepository.findOne({ where: { id } });
        if (!team) {
            return null;
        }
        team.name = name;
        team.description = description;
        return await this.teamRepository.save(team);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.teamRepository.delete(id);
        return result.affected !== 0;
    }

    async findById(id: string): Promise<Team | null> {
        return await this.teamRepository.findOne({
            where: { id },
            relations: ['users'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return await this.teamRepository.find({
            where: { tenantId },
            relations: ['users'],
        });
    }

    async addMember(teamId: string, userId: string): Promise<Team | null> {
        const team = await this.teamRepository.findOne({
            where: { id: teamId },
            relations: ['users'],
        });
        if (!team) {
            return null;
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return null;
        }

        if (!team.users.some(u => u.id === userId)) {
            team.users.push(user);
            await this.teamRepository.save(team);
        }

        return team;
    }

    async removeMember(teamId: string, userId: string): Promise<Team | null> {
        const team = await this.teamRepository.findOne({
            where: { id: teamId },
            relations: ['users'],
        });
        if (!team) {
            return null;
        }

        team.users = team.users.filter(u => u.id !== userId);
        await this.teamRepository.save(team);

        return team;
    }
}