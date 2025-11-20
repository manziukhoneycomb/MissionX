import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from '../../domain/entities/tenant.entity';
import { Role } from '../../domain/entities/role.entity';
import { User } from '../../domain/entities/user.entity';
import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { TeamRole } from '../../domain/entities/team-role.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { TeamRepository } from './repositories/team.repository';
import { TeamMemberRepository } from './repositories/team-member.repository';
import { TeamRoleRepository } from './repositories/team-role.repository';
import { getTypeOrmConfig } from './typeorm.config';
import { TENANT_REPOSITORY } from '../../application/repositories/tenant.repository.interface';
import { ROLE_REPOSITORY } from '../../application/repositories/role.repository.interface';
import { USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import { TEAM_REPOSITORY } from '../../application/repositories/team.repository.interface';
import { TEAM_MEMBER_REPOSITORY } from '../../application/repositories/team-member.repository.interface';
import { TEAM_ROLE_REPOSITORY } from '../../application/repositories/team-role.repository.interface';

const entities = [Tenant, Role, User, Team, TeamMember, TeamRole];

const providers = [
    {
        provide: TENANT_REPOSITORY,
        useClass: TenantRepository,
    },
    {
        provide: ROLE_REPOSITORY,
        useClass: RoleRepository,
    },
    {
        provide: USER_REPOSITORY,
        useClass: UserRepository,
    },
    {
        provide: TEAM_REPOSITORY,
        useClass: TeamRepository,
    },
    {
        provide: TEAM_MEMBER_REPOSITORY,
        useClass: TeamMemberRepository,
    },
    {
        provide: TEAM_ROLE_REPOSITORY,
        useClass: TeamRoleRepository,
    },
];

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
        }),
        TypeOrmModule.forFeature(entities),
    ],
    providers: [...providers],
    exports: [TypeOrmModule, ...providers],
})
export class PersistenceModule {}
