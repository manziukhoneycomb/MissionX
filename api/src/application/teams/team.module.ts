import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { TeamRole } from '../../domain/entities/team-role.entity';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { TeamCommands } from './team.commands';
import { TeamQueries } from './team.queries';
import { TeamController } from '../../api/controllers/team.controller';
import { TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { TEAM_COMMANDS } from './interfaces/team-commands.interface';
import { TEAM_QUERIES } from './interfaces/team-queries.interface';

@Module({
    imports: [TypeOrmModule.forFeature([Team, TeamMember, TeamRole])],
    controllers: [TeamController],
    providers: [
        {
            provide: TEAM_REPOSITORY,
            useClass: TeamRepository,
        },
        {
            provide: TEAM_COMMANDS,
            useClass: TeamCommands,
        },
        {
            provide: TEAM_QUERIES,
            useClass: TeamQueries,
        },
    ],
    exports: [TEAM_REPOSITORY, TEAM_COMMANDS, TEAM_QUERIES],
})
export class TeamModule {}
