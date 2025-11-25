import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { Team } from '../../../domain/entities/team.entity';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
    ) {}

    async create(dto: CreateTeamDto, tenantId: string): Promise<Team> {
        const team = this.teamRepository.create({ ...dto, tenantId });
        return this.teamRepository.save(team);
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
        await this.teamRepository.update(id, dto);
        return this.findById(id);
    }

    async delete(id: string): Promise<void> {
        await this.teamRepository.delete(id);
    }

    async findById(id: string): Promise<Team | null> {
        return this.teamRepository.findOne({
            where: { id },
            relations: ['users'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.teamRepository.find({
            where: { tenantId },
            relations: ['users'],
        });
    }

    async addMember(teamId: string, userId: string): Promise<void> {
        await this.teamRepository
            .createQueryBuilder()
            .relation(Team, 'users')
            .of(teamId)
            .add(userId);
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        await this.teamRepository
            .createQueryBuilder()
            .relation(Team, 'users')
            .of(teamId)
            .remove(userId);
    }
}
