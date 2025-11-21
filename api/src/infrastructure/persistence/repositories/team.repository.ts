import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { TeamMember } from '../../../domain/entities/team-member.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';
import { AddTeamMemberDto } from '../../../application/teams/dto/add-team-member.dto';
import { UpdateTeamMemberDto } from '../../../application/teams/dto/update-team-member.dto';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(TeamMember)
        private readonly teamMemberRepository: Repository<TeamMember>,
    ) {}

    async create(dto: CreateTeamDto): Promise<Team> {
        const team = this.teamRepository.create(dto);
        return await this.teamRepository.save(team);
    }

    async findAll(): Promise<Team[]> {
        return await this.teamRepository.find({
            relations: ['tenant', 'teamMembers', 'teamMembers.user', 'teamMembers.teamRole'],
            where: { isActive: true },
        });
    }

    async findByTenant(tenantId: string): Promise<Team[]> {
        return await this.teamRepository.find({
            where: { tenantId, isActive: true },
            relations: ['tenant', 'teamMembers', 'teamMembers.user', 'teamMembers.teamRole'],
        });
    }

    async findById(id: string): Promise<Team | null> {
        const team = await this.teamRepository.findOne({
            where: { id, isActive: true },
            relations: ['tenant'],
        });
        return team || null;
    }

    async findByIdWithMembers(id: string): Promise<Team | null> {
        const team = await this.teamRepository.findOne({
            where: { id, isActive: true },
            relations: ['tenant', 'teamMembers', 'teamMembers.user', 'teamMembers.teamRole'],
        });
        return team || null;
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
        const team = await this.teamRepository.findOne({ where: { id } });
        if (!team) {
            return null;
        }

        await this.teamRepository.update(id, dto);
        return await this.teamRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.teamRepository.update(id, { isActive: false });
        return (result.affected ?? 0) > 0;
    }

    async addMember(dto: AddTeamMemberDto): Promise<TeamMember> {
        const member = this.teamMemberRepository.create(dto);
        return await this.teamMemberRepository.save(member);
    }

    async removeMember(teamId: string, userId: string): Promise<boolean> {
        const result = await this.teamMemberRepository.update(
            { teamId, userId },
            { isActive: false },
        );
        return (result.affected ?? 0) > 0;
    }

    async updateMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberDto,
    ): Promise<TeamMember | null> {
        const member = await this.teamMemberRepository.findOne({
            where: { teamId, userId, isActive: true },
        });

        if (!member) {
            return null;
        }

        await this.teamMemberRepository.update({ teamId, userId }, dto);
        return await this.teamMemberRepository.findOne({
            where: { teamId, userId },
            relations: ['team', 'user', 'teamRole'],
        });
    }

    async getMembersByTeam(teamId: string): Promise<TeamMember[]> {
        return await this.teamMemberRepository.find({
            where: { teamId, isActive: true },
            relations: ['user', 'teamRole'],
        });
    }

    async getUserTeams(userId: string): Promise<Team[]> {
        const members = await this.teamMemberRepository.find({
            where: { userId, isActive: true },
            relations: ['team', 'team.tenant'],
        });

        return members.map((member) => member.team);
    }
}
