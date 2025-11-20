import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRole } from '../../../domain/entities/team-role.entity';
import { ITeamRoleRepository } from '../../../application/repositories/team-role.repository.interface';
import { CreateTeamRoleDto } from '../../../application/teams/dto/create-team-role.dto';
import { UpdateTeamRoleDto } from '../../../application/teams/dto/update-team-role.dto';

@Injectable()
export class TeamRoleRepository implements ITeamRoleRepository {
    constructor(
        @InjectRepository(TeamRole)
        private readonly ormRepository: Repository<TeamRole>,
    ) {}

    async create(dto: CreateTeamRoleDto): Promise<TeamRole> {
        const teamRole = this.ormRepository.create(dto);
        return this.ormRepository.save(teamRole);
    }

    async findByTeamId(teamId: string): Promise<TeamRole[]> {
        return this.ormRepository.find({
            where: { teamId },
            relations: ['teamMembers'],
        });
    }

    async findById(id: string): Promise<TeamRole | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['team', 'teamMembers'],
        });
    }

    async findByNameAndTeam(name: string, teamId: string): Promise<TeamRole | null> {
        return this.ormRepository.findOne({
            where: { name, teamId },
            relations: ['team', 'teamMembers'],
        });
    }

    async update(id: string, dto: UpdateTeamRoleDto): Promise<TeamRole | null> {
        const updateData = { ...dto };

        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }

        const result = await this.ormRepository.update(id, updateData);

        if (result.affected === 0) {
            return null;
        }

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }
}