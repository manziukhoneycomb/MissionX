import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../../domain/entities/team.entity';
import { TeamMemberRole } from '../../../domain/entities/team-member-role.entity';
import { ITeamRepository } from '../../../application/repositories/team.repository.interface';
import { CreateTeamDto } from '../../../application/teams/dto/create-team.dto';
import { UpdateTeamDto } from '../../../application/teams/dto/update-team.dto';
import { TeamRoleName } from '../../../domain/enums/team-role-name.enum';

@Injectable()
export class TeamRepository implements ITeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(TeamMemberRole)
        private readonly teamMemberRoleRepository: Repository<TeamMemberRole>,
    ) {}

    async findAll(): Promise<Team[]> {
        return this.teamRepository.find({
            relations: ['tenant'],
        });
    }

    async findByTenantId(tenantId: string): Promise<Team[]> {
        return this.teamRepository.find({
            where: { tenantId },
            relations: ['tenant'],
        });
    }

    async findById(id: string): Promise<Team | null> {
        return this.teamRepository.findOne({
            where: { id },
            relations: ['tenant'],
        });
    }

    async findByIdWithMembers(id: string): Promise<Team | null> {
        return this.teamRepository.findOne({
            where: { id },
            relations: ['tenant', 'members'],
        });
    }

    async create(teamData: CreateTeamDto): Promise<Team> {
        const team = this.teamRepository.create(teamData);
        return this.teamRepository.save(team);
    }

    async update(id: string, teamData: UpdateTeamDto): Promise<Team> {
        await this.teamRepository.update(id, teamData);
        const updatedTeam = await this.findById(id);
        if (!updatedTeam) {
            throw new Error('Team not found after update');
        }
        return updatedTeam;
    }

    async delete(id: string): Promise<void> {
        await this.teamRepository.delete(id);
    }

    async addMember(teamId: string, userId: string, roleName: string): Promise<void> {
        const existingMembership = await this.teamMemberRoleRepository.findOne({
            where: { teamId, userId },
        });

        if (existingMembership) {
            existingMembership.roleName = roleName as TeamRoleName;
            await this.teamMemberRoleRepository.save(existingMembership);
        } else {
            const teamMemberRole = this.teamMemberRoleRepository.create({
                teamId,
                userId,
                roleName: roleName as TeamRoleName,
            });
            await this.teamMemberRoleRepository.save(teamMemberRole);
        }
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        await this.teamMemberRoleRepository.delete({
            teamId,
            userId,
        });
    }

    async updateMemberRole(teamId: string, userId: string, roleName: string): Promise<void> {
        await this.teamMemberRoleRepository.update(
            { teamId, userId },
            { roleName: roleName as TeamRoleName },
        );
    }

    async getTeamMembers(teamId: string): Promise<TeamMemberRole[]> {
        return this.teamMemberRoleRepository.find({
            where: { teamId },
            relations: ['user'],
        });
    }

    async getUserTeams(userId: string): Promise<Team[]> {
        const teamMemberRoles = await this.teamMemberRoleRepository.find({
            where: { userId },
            relations: ['team', 'team.tenant'],
        });

        return teamMemberRoles.map((tmr) => tmr.team);
    }
}