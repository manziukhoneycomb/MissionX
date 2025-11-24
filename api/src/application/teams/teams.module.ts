import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from '../../api/controllers/teams.controller';
import { Team } from '../../domain/entities/team.entity';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { TEAM_REPOSITORY } from './teams.constants';
import { UserModule } from '../users/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Team]), UserModule],
    controllers: [TeamsController],
    providers: [
        TeamsService,
        {
            provide: TEAM_REPOSITORY,
            useClass: TeamRepository,
        },
    ],
    exports: [TeamsService],
})
export class TeamsModule {}
