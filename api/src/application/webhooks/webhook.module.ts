import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { WebhookController } from '../../api/controllers/webhook.controller';
import { WebhookService, WEBHOOK_REPOSITORY, WEBHOOK_LOG_REPOSITORY } from './webhook.service';
import { WebhookMapper } from './webhook.mapper';
import { WEBHOOK_SERVICE } from './interfaces/webhook.service.interface';
import { WebhookDeliveryService } from './webhook-delivery.service';
import { WebhookSigningService } from './webhook-signing.service';
import { WebhookEventService } from './webhook-event.service';

@Module({
    imports: [TypeOrmModule.forFeature([Webhook, WebhookLog])],
    controllers: [WebhookController],
    providers: [
        {
            provide: WEBHOOK_SERVICE,
            useClass: WebhookService,
        },
        WebhookMapper,
        WebhookSigningService,
        WebhookDeliveryService,
        WebhookEventService,
    ],
    exports: [
        WEBHOOK_SERVICE,
        WebhookSigningService,
        WebhookDeliveryService,
        WebhookEventService,
    ],
})
export class WebhookModule {}