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

    async create(team: Partial<Team>): Promise<Team> {
        const newTeam = this.ormRepository.create(team);
        return await this.ormRepository.save(newTeam);
    }

    async update(id: string, team: Partial<Team>): Promise<Team> {
        const existingTeam = await this.findById(id);
        if (!existingTeam) {
            this.logger.warn(`Team with ID ${id} not found for update.`);
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        this.ormRepository.merge(existingTeam, team);
        return await this.ormRepository.save(existingTeam);
    }

    async delete(id: string): Promise<void> {
        const result = await this.ormRepository.delete(id);
        if (!result.affected || result.affected === 0) {
            this.logger.warn(`Team with ID ${id} not found for deletion.`);
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
    }

    async findById(id: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['tenant', 'members'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['members'],
        });
    }

    async addMember(teamId: string, userId: string): Promise<void> {
        const team = await this.ormRepository.findOne({
            where: { id: teamId },
            relations: ['members'],
        });

        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for adding member.`);
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for adding to team.`);
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const isMemberAlready = team.members.some((member) => member.id === userId);
        if (isMemberAlready) {
            this.logger.warn(`User ${userId} is already a member of team ${teamId}`);
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
            this.logger.warn(`Team with ID ${teamId} not found for removing member.`);
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        team.members = team.members.filter((member) => member.id !== userId);
        await this.ormRepository.save(team);
    }
}
