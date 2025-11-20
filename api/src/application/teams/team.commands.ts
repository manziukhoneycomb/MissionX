import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITeamCommands } from './interfaces/team-commands.interface';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../repositories/role.repository.interface';
import { TeamDto } from './dto/team.dto';
import { TeamMemberDto } from './dto/team-member.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMapper, TeamMemberMapper } from './team.mapper';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';

@Injectable()
export class TeamCommands implements ITeamCommands {
    constructor(
        @Inject(TEAM_REPOSITORY) private readonly teamRepository: ITeamRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    ) {}

    async createTeam(tenantId: string, input: CreateTeamDto): Promise<TeamDto> {
        const team = new Team();
        team.name = input.name;
        team.description = input.description;
        team.tenantId = tenantId;
        team.isActive = true;

        const savedTeam = await this.teamRepository.create(team);
        return TeamMapper.toDto(savedTeam);
    }

    async updateTeam(teamId: string, tenantId: string, input: UpdateTeamDto): Promise<TeamDto> {
        const team = await this.teamRepository.findByIdAndTenant(teamId, tenantId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (input.name !== undefined) {
            team.name = input.name;
        }
        if (input.description !== undefined) {
            team.description = input.description;
        }
        if (input.isActive !== undefined) {
            team.isActive = input.isActive;
        }

        const savedTeam = await this.teamRepository.update(team);
        return TeamMapper.toDto(savedTeam);
    }

    async deleteTeam(teamId: string, tenantId: string): Promise<void> {
        const team = await this.teamRepository.findByIdAndTenant(teamId, tenantId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        await this.teamRepository.delete(teamId);
    }

    async addTeamMember(
        teamId: string,
        tenantId: string,
        input: AddTeamMemberDto,
    ): Promise<TeamMemberDto> {
        const team = await this.teamRepository.findByIdAndTenant(teamId, tenantId);
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        const user = await this.userRepository.findByIdAndTenant(input.userId, tenantId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const existingMember = await this.teamRepository.findTeamMember(teamId, input.userId);
        if (existingMember) {
            throw new BadRequestException('User is already a member of this team');
        }

        const teamMember = new TeamMember();
        teamMember.teamId = teamId;
        teamMember.userId = input.userId;
        teamMember.isActive = true;

        if (input.teamRoles && input.teamRoles.length > 0) {
            const roles = await this.roleRepository.findByNames(input.teamRoles);
            teamMember.teamRoles = roles;
        } else {
            teamMember.teamRoles = [];
        }

        const savedMember = await this.teamRepository.addMember(teamMember);
        return TeamMemberMapper.toDto(savedMember);
    }

    async updateTeamMember(
        teamId: string,
        memberId: string,
        tenantId: string,
        input: UpdateTeamMemberDto,
    ): Promise<TeamMemberDto> {
        const teamMember = await this.teamRepository.findTeamMemberById(teamId, memberId, tenantId);
        if (!teamMember) {
            throw new NotFoundException('Team member not found');
        }

        if (input.isActive !== undefined) {
            teamMember.isActive = input.isActive;
        }

        if (input.teamRoles !== undefined) {
            if (input.teamRoles.length > 0) {
                const roles = await this.roleRepository.findByNames(input.teamRoles);
                teamMember.teamRoles = roles;
            } else {
                teamMember.teamRoles = [];
            }
        }

        const savedMember = await this.teamRepository.updateMember(teamMember);
        return TeamMemberMapper.toDto(savedMember);
    }

    async removeTeamMember(teamId: string, memberId: string, tenantId: string): Promise<void> {
        const teamMember = await this.teamRepository.findTeamMemberById(teamId, memberId, tenantId);
        if (!teamMember) {
            throw new NotFoundException('Team member not found');
        }

        await this.teamRepository.removeMember(memberId);
    }
}
