import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from '../../api/controllers/teams.controller';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { TEAM_REPOSITORY } from '../repositories/team.repository.interface';
import { USER_REPOSITORY } from '../repositories/user.repository.interface';
import { UserRepository } from '../../infrastructure/persistence/repositories/user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Team, User])],
    controllers: [TeamsController],
    providers: [
        TeamsService,
        {
            provide: TEAM_REPOSITORY,
            useClass: TeamRepository,
        },
        {
            provide: USER_REPOSITORY,
            useClass: UserRepository,
        },
    ],
    exports: [TeamsService],
})
export class TeamsModule {}