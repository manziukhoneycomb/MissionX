import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { TeamMember } from '../../../domain/entities/team-member.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';
import { AddTeamMemberDto } from '../../../application/teams/dto/add-team-member.dto';
import { RoleName } from '../../../domain/enums/role-name.enum';

@Injectable()
export class TeamRepository implements ITeamRepository {
    private readonly logger = new Logger(TeamRepository.name);

    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(TeamMember)
        private readonly teamMemberRepository: Repository<TeamMember>,
    ) {}

    async findById(id: string): Promise<Team | null> {
        return this.teamRepository.findOne({
            where: { id },
            relations: ['tenant', 'teamMembers', 'teamMembers.user'],
        });
    }

    async findByIdAndTenant(id: string, tenantId: string): Promise<Team | null> {
        return this.teamRepository.findOne({
            where: { id, tenantId },
            relations: ['tenant', 'teamMembers', 'teamMembers.user'],
        });
    }

    async findByTenant(tenantId: string): Promise<Team[]> {
        return this.teamRepository.find({
            where: { tenantId },
            relations: ['tenant', 'teamMembers', 'teamMembers.user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Team[]> {
        const teams = await this.teamRepository
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.tenant', 'tenant')
            .leftJoinAndSelect('team.teamMembers', 'teamMember')
            .leftJoinAndSelect('teamMember.user', 'user')
            .where('teamMember.userId = :userId', { userId })
            .orderBy('team.createdAt', 'DESC')
            .getMany();

        return teams;
    }

    async create(dto: CreateTeamDto, tenantId: string, ownerId: string): Promise<Team> {
        const team = this.teamRepository.create({
            ...dto,
            tenantId,
        });

        const savedTeam = await this.teamRepository.save(team);

        const teamMember = this.teamMemberRepository.create({
            teamId: savedTeam.id,
            userId: ownerId,
            role: RoleName.TEAM_OWNER,
        });

        await this.teamMemberRepository.save(teamMember);

        return this.findById(savedTeam.id) as Promise<Team>;
    }

    async update(id: string, dto: UpdateTeamDto): Promise<Team | null> {
        const team = await this.findById(id);

        if (!team) {
            this.logger.warn(`Team with ID ${id} not found for update.`);
            return null;
        }

        this.teamRepository.merge(team, dto);
        await this.teamRepository.save(team);

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.teamRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async findTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
        return this.teamMemberRepository.findOne({
            where: { teamId, userId },
            relations: ['team', 'user'],
        });
    }

    async findTeamMembers(teamId: string): Promise<TeamMember[]> {
        return this.teamMemberRepository.find({
            where: { teamId },
            relations: ['team', 'user'],
            order: { joinedAt: 'ASC' },
        });
    }

    async addTeamMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMember> {
        const existingMember = await this.findTeamMember(teamId, dto.userId);

        if (existingMember) {
            throw new BadRequestException('User is already a member of this team');
        }

        const teamMember = this.teamMemberRepository.create({
            teamId,
            userId: dto.userId,
            role: dto.role,
        });

        const savedMember = await this.teamMemberRepository.save(teamMember);
        return this.findTeamMemberById(savedMember.id) as Promise<TeamMember>;
    }

    async removeTeamMember(teamId: string, memberId: string): Promise<boolean> {
        const result = await this.teamMemberRepository.delete({
            id: memberId,
            teamId,
        });

        return !!result?.affected && result.affected > 0;
    }

    async updateTeamMemberRole(memberId: string, role: string): Promise<TeamMember | null> {
        const member = await this.findTeamMemberById(memberId);

        if (!member) {
            this.logger.warn(`Team member with ID ${memberId} not found for role update.`);
            return null;
        }

        member.role = role as RoleName;
        await this.teamMemberRepository.save(member);

        return this.findTeamMemberById(memberId);
    }

    async findTeamMemberById(memberId: string): Promise<TeamMember | null> {
        return this.teamMemberRepository.findOne({
            where: { id: memberId },
            relations: ['team', 'user'],
        });
    }
}
