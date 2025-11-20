import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../../../domain/entities/team-member.entity';
import {
    ITeamMemberRepository,
    CreateTeamMemberDto,
    UpdateTeamMemberRoleDto,
} from '../../../application/repositories/team-member.repository.interface';

@Injectable()
export class TeamMemberRepository implements ITeamMemberRepository {
    private readonly logger = new Logger(TeamMemberRepository.name);

    constructor(
        @InjectRepository(TeamMember)
        private readonly ormRepository: Repository<TeamMember>,
    ) {}

    async findById(id: string): Promise<TeamMember | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['team', 'user', 'role'],
        });
    }

    async findByTeamId(teamId: string): Promise<readonly TeamMember[]> {
        return this.ormRepository.find({
            where: { teamId },
            relations: ['team', 'user', 'role'],
        });
    }

    async findByUserId(userId: string): Promise<readonly TeamMember[]> {
        return this.ormRepository.find({
            where: { userId },
            relations: ['team', 'user', 'role'],
        });
    }

    async findByTeamIdAndUserId(teamId: string, userId: string): Promise<TeamMember | null> {
        return this.ormRepository.findOne({
            where: { teamId, userId },
            relations: ['team', 'user', 'role'],
        });
    }

    async addMember(dto: CreateTeamMemberDto): Promise<TeamMember> {
        const existingMember = await this.findByTeamIdAndUserId(dto.teamId, dto.userId);

        if (existingMember) {
            this.logger.warn(`User ${dto.userId} is already a member of team ${dto.teamId}`);
            return existingMember;
        }

        const teamMember = this.ormRepository.create(dto);
        return await this.ormRepository.save(teamMember);
    }

    async removeMember(teamId: string, userId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ teamId, userId });
        return !!result?.affected && result.affected > 0;
    }

    async updateMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberRoleDto,
    ): Promise<TeamMember | null> {
        const teamMember = await this.findByTeamIdAndUserId(teamId, userId);

        if (!teamMember) {
            this.logger.warn(`Team member not found for team ${teamId} and user ${userId}`);
            return null;
        }

        this.ormRepository.merge(teamMember, dto);
        return await this.ormRepository.save(teamMember);
    }

    async getMembersByRole(teamId: string, roleId: string): Promise<readonly TeamMember[]> {
        return this.ormRepository.find({
            where: { teamId, roleId },
            relations: ['team', 'user', 'role'],
        });
    }
}
