import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from '../../domain/entities/tenant.entity';
import { Role } from '../../domain/entities/role.entity';
import { User } from '../../domain/entities/user.entity';
import { Task } from '../../domain/entities/task.entity';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceItem } from '../../domain/entities/invoice-item.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { TaskRepository } from './repositories/task.repository';
import { getTypeOrmConfig } from './typeorm.config';
import { TENANT_REPOSITORY } from '../../application/repositories/tenant.repository.interface';
import { ROLE_REPOSITORY } from '../../application/repositories/role.repository.interface';
import { USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import { TASK_REPOSITORY } from '../../application/repositories/task.repository.interface';

const entities = [Tenant, Role, User, Task, Invoice, InvoiceItem];

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
        provide: TASK_REPOSITORY,
        useClass: TaskRepository,
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
