import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from '../../api/controllers/teams.controller';
import { Team } from '../../domain/entities/team.entity';
import { TeamRepository } from '../../infrastructure/persistence/repositories/team.repository';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../infrastructure/persistence/repositories/user.repository';
import { RoleRepository } from '../../infrastructure/persistence/repositories/role.repository';
import { Role } from '../../domain/entities/role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Team, User, Role])],
    controllers: [TeamsController],
    providers: [
        TeamsService,
        {
            provide: 'TEAM_REPOSITORY',
            useClass: TeamRepository,
        },
        {
            provide: 'USER_REPOSITORY',
            useClass: UserRepository,
        },
        {
            provide: 'ROLE_REPOSITORY',
            useClass: RoleRepository,
        }
    ],
    exports: [TeamsService],
})
export class TeamsModule {}
