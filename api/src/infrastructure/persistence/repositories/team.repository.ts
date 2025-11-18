import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly ormRepository: Repository<Team>,
    ) {}

    async create(team: Partial<Team>): Promise<Team> {
        const newTeam = this.ormRepository.create(team);
        return this.ormRepository.save(newTeam);
    }

    async findAll(): Promise<Team[]> {
        return this.ormRepository.find({
            relations: ['tenant'],
        });
    }

    async findById(id: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });
    }

    async findByTenant(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: {
                teamRoles: {
                    userId,
                },
            },
            relations: ['tenant', 'teamRoles', 'teamRoles.user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findWithMembers(id: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: [
                'tenant',
                'teamRoles',
                'teamRoles.user',
            ],
        });
    }

    async update(id: string, updates: Partial<Team>): Promise<Team | null> {
        const updateData = { ...updates };
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.deletedAt;

        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }

        const result = await this.ormRepository.update(id, updateData);

        if (result.affected === 0) {
            return null;
        }

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.softDelete(id);
        return !!result?.affected && result.affected > 0;
    }
}