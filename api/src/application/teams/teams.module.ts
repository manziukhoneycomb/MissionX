import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController } from '../../api/controllers/teams.controller';
import { TeamsService } from './teams.service';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { Team } from '../../domain/entities/team.entity';
import { UserModule } from '../users/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Team]), UserModule],
    controllers: [TeamsController],
    providers: [
        {
            provide: 'TEAM_REPOSITORY',
            useClass: TeamRepository,
        },
        TeamsService,
    ],
    exports: [TeamsService],
})
export class TeamsModule {}
