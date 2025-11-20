import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly ormRepository: Repository<Team>,
    ) {}

    async create(dto: CreateTeamDto): Promise<Team> {
        const team = this.ormRepository.create(dto);
        return this.ormRepository.save(team);
    }

    async findAll(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['teamMembers', 'teamRoles'],
        });
    }

    async findById(id: string, tenantId: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id, tenantId },
            relations: ['teamMembers', 'teamRoles'],
        });
    }

    async findByName(name: string, tenantId: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { name, tenantId },
            relations: ['teamMembers', 'teamRoles'],
        });
    }

    async update(id: string, dto: UpdateTeamDto, tenantId: string): Promise<Team | null> {
        const updateData = { ...dto };

        if (Object.keys(updateData).length === 0) {
            return this.findById(id, tenantId);
        }

        const result = await this.ormRepository.update({ id, tenantId }, updateData);

        if (result.affected === 0) {
            return null;
        }

        return this.findById(id, tenantId);
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ id, tenantId });
        return !!result?.affected && result.affected > 0;
    }
}