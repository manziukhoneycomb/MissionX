import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { TeamDto, TeamMemberDto } from './dto/team.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    async findById(id: string, tenantId: string): Promise<TeamDto> {
        this.logger.log(`Finding team ${id} for tenant ${tenantId}`);

        const team = await this.teamRepository.findById(id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to team from different tenant');
        }

        return TeamDto.fromEntity(team);
    }

    async findAll(tenantId: string): Promise<TeamDto[]> {
        this.logger.log(`Finding all teams for tenant ${tenantId}`);

        const teams = await this.teamRepository.findByTenantId(tenantId);

        return teams.map((team) => TeamDto.fromEntity(team));
    }

    async findMembers(teamId: string, tenantId: string): Promise<TeamMemberDto[]> {
        this.logger.log(`Finding members of team ${teamId} for tenant ${tenantId}`);

        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${teamId} not found`);
        }

        if (team.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to team from different tenant');
        }

        const members = await this.teamRepository.findMembers(teamId);

        return members.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        }));
    }
}
