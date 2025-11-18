import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { CreateWebhookEventDto } from '../webhooks/dto/create-webhook-event.dto';
import { UpdateWebhookEventDto } from '../webhooks/dto/update-webhook-event.dto';

export interface IWebhookEventRepository {
    findById(id: string): Promise<WebhookEvent | null>;
    findByName(name: string, tenantId: string): Promise<WebhookEvent | null>;
    findAllByTenantId(tenantId: string): Promise<WebhookEvent[]>;
    findActiveByTenantId(tenantId: string): Promise<WebhookEvent[]>;
    create(dto: CreateWebhookEventDto, tenantId: string): Promise<WebhookEvent>;
    update(id: string, dto: UpdateWebhookEventDto): Promise<WebhookEvent | null>;
    delete(id: string): Promise<boolean>;
    activate(id: string): Promise<void>;
    deactivate(id: string): Promise<void>;
}

export const WEBHOOK_EVENT_REPOSITORY = 'IWebhookEventRepository';