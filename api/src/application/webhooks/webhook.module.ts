import { Module } from '@nestjs/common';
import { WebhookCommands } from './webhook.commands';
import { WebhookQueries } from './webhook.queries';
import { WebhookEventCommands } from './webhook-event.commands';
import { WebhookEventQueries } from './webhook-event.queries';
import { WebhookLogQueries } from './webhook-log.queries';
import { WEBHOOK_COMMANDS } from './interfaces/webhook-commands.interface';
import { WEBHOOK_QUERIES } from './interfaces/webhook-queries.interface';
import { WEBHOOK_EVENT_COMMANDS } from './interfaces/webhook-event-commands.interface';
import { WEBHOOK_EVENT_QUERIES } from './interfaces/webhook-event-queries.interface';
import { WEBHOOK_LOG_QUERIES } from './interfaces/webhook-log-queries.interface';

@Module({
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
            provide: WEBHOOK_EVENT_COMMANDS,
            useClass: WebhookEventCommands,
        },
        {
            provide: WEBHOOK_EVENT_QUERIES,
            useClass: WebhookEventQueries,
        },
        {
            provide: WEBHOOK_LOG_QUERIES,
            useClass: WebhookLogQueries,
        },
    ],
    exports: [
        WEBHOOK_COMMANDS,
        WEBHOOK_QUERIES,
        WEBHOOK_EVENT_COMMANDS,
        WEBHOOK_EVENT_QUERIES,
        WEBHOOK_LOG_QUERIES,
    ],
})
export class WebhookModule {}