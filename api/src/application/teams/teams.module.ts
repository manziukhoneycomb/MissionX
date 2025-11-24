import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import { TeamsService } from './teams.service';
import { TEAM_SERVICE } from './interfaces/team.service.interface';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { TeamMapper } from './team.mapper';

@Module({
    imports: [TypeOrmModule.forFeature([Team, User])],
    providers: [
        {
            provide: TEAM_SERVICE,
            useClass: TeamsService,
        },
        {
            provide: TEAM_REPOSITORY,
            useClass: TeamRepository,
        },
        TeamMapper,
    ],
    exports: [TEAM_SERVICE],
})
export class TeamsModule {}
