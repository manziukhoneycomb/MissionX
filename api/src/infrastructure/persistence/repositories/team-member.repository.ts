import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../../../domain/entities/team-member.entity';
import {
    ITeamMemberRepository,
    AddTeamMemberDto,
    UpdateTeamMemberDto,
} from '../../../application/repositories/team-member.repository.interface';
import {
    IRoleRepository,
    ROLE_REPOSITORY,
} from '../../../application/repositories/role.repository.interface';
import {
    IUserRepository,
    USER_REPOSITORY,
} from '../../../application/repositories/user.repository.interface';

@Injectable()
export class TeamMemberRepository implements ITeamMemberRepository {
    private readonly logger = new Logger(TeamMemberRepository.name);

    constructor(
        @InjectRepository(TeamMember)
        private readonly ormRepository: Repository<TeamMember>,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async findByTeamId(teamId: string): Promise<readonly TeamMember[]> {
        return this.ormRepository.find({
            where: { teamId },
            relations: ['user', 'role', 'team'],
        });
    }

    async findByUserId(userId: string): Promise<readonly TeamMember[]> {
        return this.ormRepository.find({
            where: { userId },
            relations: ['user', 'role', 'team'],
        });
    }

    async findByTeamAndUserId(teamId: string, userId: string): Promise<TeamMember | null> {
        return this.ormRepository.findOne({
            where: { teamId, userId },
            relations: ['user', 'role', 'team'],
        });
    }

    async addMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMember> {
        const existingMember = await this.findByTeamAndUserId(teamId, dto.userId);
        if (existingMember) {
            throw new BadRequestException('User is already a member of this team');
        }

        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new BadRequestException(`User with ID ${dto.userId} not found`);
        }

        const role = await this.roleRepository.findById(dto.roleId);
        if (!role) {
            throw new BadRequestException(`Role with ID ${dto.roleId} not found`);
        }

        const teamMember = this.ormRepository.create({
            teamId,
            userId: dto.userId,
            roleId: dto.roleId,
        });

        return await this.ormRepository.save(teamMember);
    }

    async updateMemberRole(
        teamId: string,
        userId: string,
        dto: UpdateTeamMemberDto,
    ): Promise<TeamMember | null> {
        const teamMember = await this.findByTeamAndUserId(teamId, userId);
        if (!teamMember) {
            this.logger.warn(
                `TeamMember with teamId ${teamId} and userId ${userId} not found for update.`,
            );
            return null;
        }

        const role = await this.roleRepository.findById(dto.roleId);
        if (!role) {
            throw new BadRequestException(`Role with ID ${dto.roleId} not found`);
        }

        this.ormRepository.merge(teamMember, { roleId: dto.roleId });
        return await this.ormRepository.save(teamMember);
    }

    async removeMember(teamId: string, userId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ teamId, userId });
        return !!result?.affected && result.affected > 0;
    }
}
