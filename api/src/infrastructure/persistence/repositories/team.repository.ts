import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';

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

    async findByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['tenant'],
        });
    }

    async findByTenantIdAndName(tenantId: string, name: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { tenantId, name },
            relations: ['tenant'],
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
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async addMember(teamId: string, userId: string, role?: string): Promise<void> {
        this.logger.log(`Adding member ${userId} to team ${teamId} with role ${role}`);
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        this.logger.log(`Removing member ${userId} from team ${teamId}`);
    }

    async getMembers(teamId: string): Promise<any[]> {
        const team = await this.findById(teamId);
        return team?.members || [];
    }
}
