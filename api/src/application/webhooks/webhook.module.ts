import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { WebhookCommands } from './webhook.commands';
import { WebhookQueries } from './webhook.queries';
import { WebhookRepository } from '../../infrastructure/persistence/repositories/webhook.repository';
import { WebhookEventRepository } from '../../infrastructure/persistence/repositories/webhook-event.repository';
import { WebhookLogRepository } from '../../infrastructure/persistence/repositories/webhook-log.repository';
import { WEBHOOK_COMMANDS } from './interfaces/webhook-commands.interface';
import { WEBHOOK_QUERIES } from './interfaces/webhook-queries.interface';
import { WEBHOOK_REPOSITORY } from '../repositories/webhook.repository.interface';
import { WEBHOOK_EVENT_REPOSITORY } from '../repositories/webhook-event.repository.interface';
import { WEBHOOK_LOG_REPOSITORY } from '../repositories/webhook-log.repository.interface';

@Module({
    imports: [TypeOrmModule.forFeature([Webhook, WebhookEvent, WebhookLog])],
    providers: [
        {
            provide: WEBHOOK_COMMANDS,
            useClass: WebhookCommands,
        },
        {
            provide: WEBHOOK_QUERIES,
            useClass: WebhookQueries,
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
    ],
    exports: [
        WEBHOOK_COMMANDS,
        WEBHOOK_QUERIES,
        WEBHOOK_REPOSITORY,
        WEBHOOK_EVENT_REPOSITORY,
        WEBHOOK_LOG_REPOSITORY,
    ],
})
export class WebhookModule {}