import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from '../../domain/entities/tenant.entity';
import { Role } from '../../domain/entities/role.entity';
import { User } from '../../domain/entities/user.entity';
import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { WebhookRepository } from './repositories/webhook.repository';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { WebhookLogRepository } from './repositories/webhook-log.repository';
import { getTypeOrmConfig } from './typeorm.config';
import { TENANT_REPOSITORY } from '../../application/repositories/tenant.repository.interface';
import { ROLE_REPOSITORY } from '../../application/repositories/role.repository.interface';
import { USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import {
    WEBHOOK_REPOSITORY,
    WEBHOOK_EVENT_REPOSITORY,
    WEBHOOK_LOG_REPOSITORY,
} from '../../application/repositories/webhook.repository';

const entities = [Tenant, Role, User, Webhook, WebhookEvent, WebhookLog];

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
        provide: WEBHOOK_REPOSITORY,
        useClass: WebhookRepository,
    },
    {
        provide: WEBHOOK_EVENT_REPOSITORY,
        useClass: WebhookEventRepository,
    },
    {
        provide: WEBHOOK_LOG_REPOSITORY,
        useClass: WebhookLogRepository,
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
