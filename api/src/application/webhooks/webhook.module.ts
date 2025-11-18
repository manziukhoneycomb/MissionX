import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhookSigningService } from './webhook-signing.service';
import { WebhookEventProcessorService } from './webhook-event-processor.service';
import { WebhookLoggingService } from './webhook-logging.service';
import { WEBHOOK_SERVICE } from './interfaces/webhook.service.interface';
import {
    WEBHOOK_REPOSITORY,
    WEBHOOK_EVENT_REPOSITORY,
    WEBHOOK_LOG_REPOSITORY,
} from '../repositories/webhook.repository';

@Module({
    providers: [
        {
            provide: WEBHOOK_SERVICE,
            useClass: WebhookService,
        },
        WebhookDeliveryService,
        WebhookSigningService,
        WebhookEventProcessorService,
        WebhookLoggingService,
    ],
    exports: [
        WEBHOOK_SERVICE,
        WebhookDeliveryService,
        WebhookSigningService,
        WebhookEventProcessorService,
        WebhookLoggingService,
    ],
})
export class WebhookModule {}