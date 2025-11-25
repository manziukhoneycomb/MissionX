import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
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

    async findById(id: string, tenantId?: string): Promise<Team | null> {
        const whereClause: { id: string; tenantId?: string } = { id };
        if (tenantId) {
            whereClause.tenantId = tenantId;
        }
        return this.ormRepository.findOne({
            where: whereClause,
            relations: ['tenant', 'members'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['tenant', 'members'],
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
        const team = await this.ormRepository.findOne({
            where: { id: teamId },
            relations: ['members'],
        });

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found.`);
            throw new NotFoundException(`Team with ID ${teamId} not found.`);
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            this.logger.warn(`User with ID ${userId} not found.`);
            throw new NotFoundException(`User with ID ${userId} not found.`);
        }

        if (user.tenantId !== team.tenantId) {
            this.logger.warn(
                `User ${userId} does not belong to the same tenant as team ${teamId}.`,
            );
            throw new BadRequestException('User does not belong to the same tenant as the team.');
        }

        const alreadyMember = team.members.some((member) => member.id === userId);
        if (alreadyMember) {
            this.logger.warn(`User ${userId} is already a member of team ${teamId}.`);
            return;
        }

        team.members.push(user);
        await this.ormRepository.save(team);
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        const team = await this.ormRepository.findOne({
            where: { id: teamId },
            relations: ['members'],
        });

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found.`);
            throw new NotFoundException(`Team with ID ${teamId} not found.`);
        }

        team.members = team.members.filter((member) => member.id !== userId);
        await this.ormRepository.save(team);
    }
}
