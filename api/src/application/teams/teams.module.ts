import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from '../../api/controllers/teams.controller';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { TEAM_REPOSITORY } from '../repositories/team.repository.interface';

@Module({
    imports: [TypeOrmModule.forFeature([Team, User])],
    controllers: [TeamsController],
    providers: [
        TeamsService,
        {
            provide: TEAM_REPOSITORY,
            useClass: TeamRepository,
        },
    ],
    exports: [TeamsService, TEAM_REPOSITORY],
})
export class TeamsModule {}
