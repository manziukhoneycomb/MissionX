import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TEAMS_SERVICE } from './interfaces/teams.service.interface';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Team, User])],
    providers: [
        {
            provide: TEAMS_SERVICE,
            useClass: TeamsService,
        },
        {
            provide: TEAM_REPOSITORY,
            useClass: TeamRepository,
        },
    ],
    exports: [TEAMS_SERVICE, TEAM_REPOSITORY],
})
export class TeamsModule {}
