import { WebhookDto } from '../dto/webhook.dto';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import { WebhookLog } from '../../../domain/entities/webhook-log.entity';

export interface IWebhookService {
    findAll(tenantId: string): Promise<WebhookDto[]>;
    findById(id: string, tenantId: string): Promise<WebhookDto>;
    create(dto: CreateWebhookDto, tenantId: string): Promise<WebhookDto>;
    update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<WebhookDto>;
    delete(id: string, tenantId: string): Promise<void>;
    activate(id: string, tenantId: string): Promise<void>;
    deactivate(id: string, tenantId: string): Promise<void>;
    getDeliveryLogs(id: string, tenantId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    triggerWebhook(eventType: string, payload: any, tenantId: string): Promise<void>;
}

export const WEBHOOK_SERVICE = 'IWebhookService';