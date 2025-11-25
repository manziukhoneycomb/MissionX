import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ITeamQueries } from './interfaces/team-queries.interface';
import { ITeamRepository, TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { TeamDto, TeamMemberDto } from './dto/team.dto';

@Injectable()
export class TeamQueries implements ITeamQueries {
    private readonly logger = new Logger(TeamQueries.name);

    constructor(
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    async findTeamById(id: string, tenantId: string): Promise<TeamDto> {
        this.logger.log(`Finding team ${id} for tenant ${tenantId}`);

        const team = await this.teamRepository.findById(id, tenantId);

        if (!team) {
            throw new NotFoundException(`Team with ID ${id} not found`);
        }

        return TeamDto.fromEntity(team);
    }

    async findAllTeams(tenantId: string): Promise<TeamDto[]> {
        this.logger.log(`Finding all teams for tenant ${tenantId}`);

        const teams = await this.teamRepository.findByTenantId(tenantId);

        return teams.map((team) => TeamDto.fromEntity(team));
    }

    async findTeamMembers(teamId: string, tenantId: string): Promise<TeamMemberDto[]> {
        this.logger.log(`Finding members for team ${teamId} for tenant ${tenantId}`);

        const members = await this.teamRepository.findMembers(teamId, tenantId);

        return members.map((member) => ({
            id: member.id,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
        }));
    }
}
