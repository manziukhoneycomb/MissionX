import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../../../domain/entities/team-member.entity';
import { ITeamMemberRepository } from '../../../application/repositories/team-member.repository.interface';
import { AddTeamMemberDto } from '../../../application/teams/dto/add-team-member.dto';

@Injectable()
export class TeamMemberRepository implements ITeamMemberRepository {
    constructor(
        @InjectRepository(TeamMember)
        private readonly ormRepository: Repository<TeamMember>,
    ) {}

    async addMember(dto: AddTeamMemberDto): Promise<TeamMember> {
        const teamMember = this.ormRepository.create(dto);
        return this.ormRepository.save(teamMember);
    }

    async removeMember(teamId: string, userId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ teamId, userId });
        return !!result?.affected && result.affected > 0;
    }

    async findByTeamId(teamId: string): Promise<TeamMember[]> {
        return this.ormRepository.find({
            where: { teamId },
            relations: ['user', 'teamRole'],
        });
    }

    async findByUserId(userId: string): Promise<TeamMember[]> {
        return this.ormRepository.find({
            where: { userId },
            relations: ['team', 'teamRole'],
        });
    }

    async findByTeamAndUser(teamId: string, userId: string): Promise<TeamMember | null> {
        return this.ormRepository.findOne({
            where: { teamId, userId },
            relations: ['team', 'user', 'teamRole'],
        });
    }

    async updateMemberRole(teamId: string, userId: string, teamRoleId: string | null): Promise<TeamMember | null> {
        const updateData: any = {};
        updateData.teamRoleId = teamRoleId;
        
        const result = await this.ormRepository.update(
            { teamId, userId },
            updateData
        );

        if (result.affected === 0) {
            return null;
        }

        return this.findByTeamAndUser(teamId, userId);
    }
}