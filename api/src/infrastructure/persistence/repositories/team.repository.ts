import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { TeamMember } from '../../../domain/entities/team-member.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(TeamMember)
        private readonly teamMemberRepository: Repository<TeamMember>,
    ) {}

    async create(team: Team): Promise<Team> {
        return this.teamRepository.save(team);
    }

    async update(team: Team): Promise<Team> {
        return this.teamRepository.save(team);
    }

    async delete(teamId: string): Promise<void> {
        await this.teamRepository.delete(teamId);
    }

    async findByTenant(tenantId: string, relations: string[] = []): Promise<Team[]> {
        return this.teamRepository.find({
            where: { tenantId },
            relations,
            order: { createdAt: 'DESC' },
        });
    }

    async findByIdAndTenant(
        teamId: string,
        tenantId: string,
        relations: string[] = [],
    ): Promise<Team | null> {
        return this.teamRepository.findOne({
            where: { id: teamId, tenantId },
            relations,
        });
    }

    async findTeamsByUser(
        userId: string,
        tenantId: string,
        relations: string[] = [],
    ): Promise<Team[]> {
        return this.teamRepository
            .createQueryBuilder('team')
            .innerJoin('team.members', 'member')
            .where('member.userId = :userId', { userId })
            .andWhere('team.tenantId = :tenantId', { tenantId })
            .andWhere('member.isActive = :isActive', { isActive: true })
            .andWhere('team.isActive = :teamActive', { teamActive: true })
            .orderBy('team.createdAt', 'DESC')
            .getMany();
    }

    async addMember(teamMember: TeamMember): Promise<TeamMember> {
        return this.teamMemberRepository.save(teamMember);
    }

    async updateMember(teamMember: TeamMember): Promise<TeamMember> {
        return this.teamMemberRepository.save(teamMember);
    }

    async removeMember(memberId: string): Promise<void> {
        await this.teamMemberRepository.delete(memberId);
    }

    async findTeamMembers(teamId: string, relations: string[] = []): Promise<TeamMember[]> {
        return this.teamMemberRepository.find({
            where: { teamId },
            relations,
            order: { createdAt: 'ASC' },
        });
    }

    async findTeamMember(
        teamId: string,
        userId: string,
        relations: string[] = [],
    ): Promise<TeamMember | null> {
        return this.teamMemberRepository.findOne({
            where: { teamId, userId },
            relations,
        });
    }

    async findTeamMemberById(
        teamId: string,
        memberId: string,
        tenantId: string,
        relations: string[] = [],
    ): Promise<TeamMember | null> {
        const queryBuilder = this.teamMemberRepository
            .createQueryBuilder('member')
            .innerJoin('member.team', 'team')
            .where('member.id = :memberId', { memberId })
            .andWhere('member.teamId = :teamId', { teamId })
            .andWhere('team.tenantId = :tenantId', { tenantId });

        relations.forEach((relation) => {
            queryBuilder.leftJoinAndSelect(`member.${relation}`, relation);
        });

        return queryBuilder.getOne();
    }
}
