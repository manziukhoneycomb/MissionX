import { Module } from '@nestjs/common';
import { TeamCommands } from './team.commands';
// import { TeamQueries } from './team.queries';
import { TEAM_COMMANDS } from './interfaces/team-commands.interface';
// import { TEAM_QUERIES } from './interfaces/team-queries.interface';

@Module({
    providers: [
        {
            provide: TEAM_COMMANDS,
            useClass: TeamCommands,
        },
        // {
        //     provide: TEAM_QUERIES,
        //     useClass: TeamQueries,
        // },
    ],
    exports: [TEAM_COMMANDS /* TEAM_QUERIES */],
})
export class TeamsModule {}
