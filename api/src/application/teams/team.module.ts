import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import { TeamCommands } from './team.commands';
import { TeamQueries } from './team.queries';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { TeamMapper } from './team.mapper';
import { TEAM_COMMANDS } from './interfaces/team-commands.interface';
import { TEAM_QUERIES } from './interfaces/team-queries.interface';
import { TEAM_REPOSITORY } from '../repositories/team.repository.interface';

@Module({
    imports: [TypeOrmModule.forFeature([Team, User])],
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
        TeamMapper,
    ],
    exports: [TEAM_COMMANDS, TEAM_QUERIES],
})
export class TeamModule {}