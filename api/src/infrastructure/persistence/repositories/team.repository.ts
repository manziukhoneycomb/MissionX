import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(dto: CreateTeamDto, tenantId: string): Promise<Team> {
        const team = this.teamRepository.create({
            ...dto,
            tenantId,
        });
        return this.teamRepository.save(team);
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team> {
        await this.teamRepository.update(id, dto);
        const updatedTeam = await this.teamRepository.findOne({ where: { id } });
        if (!updatedTeam) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }
        return updatedTeam;
    }

    async delete(id: string): Promise<void> {
        await this.teamRepository.delete(id);
    }

    async findById(id: string, tenantId: string): Promise<Team | null> {
        return this.teamRepository.findOne({
            where: { id, tenantId },
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
        const team = await this.teamRepository.findOne({
            where: { id: teamId },
            relations: ['users'],
        });
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (team && user) {
            team.users = [...(team.users || []), user];
            await this.teamRepository.save(team);
        }
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        const team = await this.teamRepository.findOne({
            where: { id: teamId },
            relations: ['users'],
        });

        if (team) {
            team.users = team.users.filter((u) => u.id !== userId);
            await this.teamRepository.save(team);
        }
    }
}
