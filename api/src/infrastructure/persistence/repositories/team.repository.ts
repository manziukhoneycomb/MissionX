import { Injectable, Logger } from '@nestjs/common';
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

    async findById(id: string, tenantId: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id, tenantId },
            relations: ['members', 'tenant'],
        });
    }

    async findByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['members', 'tenant'],
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

    async update(
        id: string,
        tenantId: string,
        name?: string,
        description?: string,
    ): Promise<Team | null> {
        const team = await this.findById(id, tenantId);

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

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ id, tenantId });
        return !!result?.affected && result.affected > 0;
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.findById(teamId, tenantId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for adding member.`);
            return;
        }

        const user = await this.userRepository.findOne({ where: { id: userId, tenantId } });

        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for adding to team.`);
            return;
        }

        const memberIds = team.members.map((m) => m.id);
        if (!memberIds.includes(userId)) {
            team.members.push(user);
            await this.ormRepository.save(team);
        }
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<void> {
        const team = await this.findById(teamId, tenantId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for removing member.`);
            return;
        }

        team.members = team.members.filter((member) => member.id !== userId);
        await this.ormRepository.save(team);
    }

    async findMembers(teamId: string, tenantId: string): Promise<User[]> {
        const team = await this.findById(teamId, tenantId);

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for fetching members.`);
            return [];
        }

        return team.members;
    }
}
