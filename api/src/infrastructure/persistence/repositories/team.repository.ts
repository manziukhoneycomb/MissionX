import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly repository: Repository<Team>,
    ) {}

    async create(data: Partial<Team>): Promise<Team> {
        const team = this.repository.create(data);
        return this.repository.save(team);
    }

    async update(id: string, data: Partial<Team>): Promise<Team> {
        await this.repository.update(id, data);
        return this.repository.findOneByOrFail({ id });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async findById(id: string): Promise<Team | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['users'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.repository.find({
            where: { tenantId },
            relations: ['users'],
        });
    }

    async save(team: Team): Promise<Team> {
        return this.repository.save(team);
    }
}
