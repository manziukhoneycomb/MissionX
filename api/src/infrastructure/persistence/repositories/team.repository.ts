import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import {
    ITeamRepository,
    CreateTeamDto,
    UpdateTeamDto,
} from '../../../application/repositories/team.repository.interface';

@Injectable()
export class TeamRepository implements ITeamRepository {
    private readonly logger = new Logger(TeamRepository.name);

    constructor(
        @InjectRepository(Team)
        private readonly ormRepository: Repository<Team>,
    ) {}

    async findById(id: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['tenant', 'members', 'members.user', 'members.role'],
        });
    }

    async findByTenantId(tenantId: string): Promise<readonly Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['tenant', 'members', 'members.user', 'members.role'],
        });
    }

    async findByName(name: string, tenantId: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { name, tenantId },
            relations: ['tenant', 'members', 'members.user', 'members.role'],
        });
    }

    async findAll(): Promise<readonly Team[]> {
        return this.ormRepository.find({
            relations: ['tenant', 'members', 'members.user', 'members.role'],
        });
    }

    async create(dto: CreateTeamDto, tenantId: string): Promise<Team> {
        const team = this.ormRepository.create({
            ...dto,
            tenantId,
        });

        return await this.ormRepository.save(team);
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
        const team = await this.findById(id);

        if (!team) {
            this.logger.warn(`Team with ID ${id} not found for update.`);
            return null;
        }

        this.ormRepository.merge(team, dto);
        return await this.ormRepository.save(team);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.softDelete(id);
        return !!result?.affected && result.affected > 0;
    }
}
