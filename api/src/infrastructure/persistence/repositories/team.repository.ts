import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    async create(tenantId: string, dto: CreateTeamDto): Promise<Team> {
        const team = this.ormRepository.create({ ...dto, tenantId });
        return this.ormRepository.save(team);
    }

    async update(id: string, tenantId: string, dto: UpdateTeamDto): Promise<Team | null> {
        const team = await this.ormRepository.findOne({ where: { id, tenantId } });
        if (!team) {
            return null;
        }
        this.ormRepository.merge(team, dto);
        return this.ormRepository.save(team);
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ id, tenantId });
        return !!result?.affected && result.affected > 0;
    }

    async findById(id: string, tenantId: string): Promise<Team | null> {
        return this.ormRepository.findOne({ where: { id, tenantId }, relations: ['users'] });
    }

    async findAllByTenantId(tenantId: string): Promise<Team[]> {
        return this.ormRepository.find({ where: { tenantId }, relations: ['users'] });
    }

    async addMember(teamId: string, userId: string, tenantId: string): Promise<Team | null> {
        const team = await this.ormRepository.findOne({
            where: { id: teamId, tenantId },
            relations: ['users'],
        });
        if (!team) {
            this.logger.warn(`Team with ID ${teamId} not found for tenant ${tenantId}.`);
            return null;
        }

        const user = await this.userRepository.findOne({ where: { id: userId, tenantId } });
        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for tenant ${tenantId}.`);
            throw new NotFoundException(
                `User with ID ${userId} not found or does not belong to the same tenant.`,
            );
        }

        const isMember = team.users.some((member) => member.id === userId);
        if (isMember) {
            return team;
        }

        team.users.push(user);
        return this.ormRepository.save(team);
    }

    async removeMember(teamId: string, userId: string, tenantId: string): Promise<Team | null> {
        const team = await this.ormRepository.findOne({
            where: { id: teamId, tenantId },
            relations: ['users'],
        });
        if (!team) {
            return null;
        }

        team.users = team.users.filter((member) => member.id !== userId);
        return this.ormRepository.save(team);
    }
}
