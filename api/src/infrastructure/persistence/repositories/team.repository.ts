import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class TeamRepository implements ITeamRepository {
    private readonly logger = new Logger(TeamRepository.name);

    constructor(
        @InjectRepository(Team)
        private readonly ormRepository: Repository<Team>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findById(id: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['tenant'],
            order: { name: 'ASC' },
        });
    }

    async create(dto: CreateTeamDto, tenantId: string): Promise<Team> {
        const team = this.ormRepository.create({
            ...dto,
            tenantId,
        });

        const savedTeam = await this.ormRepository.save(team);
        return this.findById(savedTeam.id) as Promise<Team>;
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
        const team = await this.findById(id);
        if (!team) {
            return null;
        }

        await this.ormRepository.update(id, dto);
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return result.affected !== 0;
    }

    async addUsers(teamId: string, userIds: string[]): Promise<Team> {
        const team = await this.findTeamWithUsers(teamId);
        if (!team) {
            throw new Error('Team not found');
        }

        const users = await this.userRepository.find({
            where: {
                id: In(userIds),
                tenantId: team.tenantId,
            },
        });

        if (users.length !== userIds.length) {
            throw new Error('Some users not found or belong to different tenant');
        }

        team.users = [
            ...team.users,
            ...users.filter((u) => !team.users.find((tu) => tu.id === u.id)),
        ];

        await this.ormRepository.save(team);
        return this.findTeamWithUsers(teamId) as Promise<Team>;
    }

    async removeUsers(teamId: string, userIds: string[]): Promise<Team> {
        const team = await this.findTeamWithUsers(teamId);
        if (!team) {
            throw new Error('Team not found');
        }

        team.users = team.users.filter((u) => !userIds.includes(u.id));

        await this.ormRepository.save(team);
        return this.findTeamWithUsers(teamId) as Promise<Team>;
    }

    async findTeamWithUsers(id: string): Promise<Team | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['tenant', 'users'],
        });
    }
}
