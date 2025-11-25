import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { User } from '../../../domain/entities/user.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';

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
            relations: ['tenant', 'members'],
        });
    }

    async findByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['members'],
        });
    }

    async create(name: string, description: string | undefined, tenantId: string): Promise<Team> {
        const team = this.ormRepository.create({
            name,
            description,
            tenantId,
            members: [],
        });

        return await this.ormRepository.save(team);
    }

    async update(id: string, name?: string, description?: string): Promise<Team | null> {
        const team = await this.findById(id);

        if (!team) {
            this.logger.warn(`Team with ID ${id} not found for update.`);
            return null;
        }

        if (name !== undefined) {
            team.name = name;
        }

        if (description !== undefined) {
            team.description = description;
        }

        return await this.ormRepository.save(team);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async addMember(teamId: string, userId: string): Promise<void> {
        const team = await this.findById(teamId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found.`);
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            this.logger.warn(`User with ID ${userId} not found.`);
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (!team.members) {
            team.members = [];
        }

        const alreadyMember = team.members.some((member) => member.id === userId);

        if (!alreadyMember) {
            team.members.push(user);
            await this.ormRepository.save(team);
        }
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        const team = await this.findById(teamId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found.`);
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (!team.members) {
            return;
        }

        team.members = team.members.filter((member) => member.id !== userId);
        await this.ormRepository.save(team);
    }

    async findMembers(teamId: string): Promise<User[]> {
        const team = await this.findById(teamId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found.`);
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        return team.members || [];
    }
}
