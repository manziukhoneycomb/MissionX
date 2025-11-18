import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { CreateWebhookEventDto } from '../webhooks/dto/create-webhook-event.dto';

export interface IWebhookEventRepository {
    create(dto: CreateWebhookEventDto, tenantId?: string): Promise<WebhookEvent>;
    findAll(tenantId?: string): Promise<WebhookEvent[]>;
    findById(id: string): Promise<WebhookEvent | null>;
    findByEventType(eventType: string, tenantId?: string): Promise<WebhookEvent | null>;
    findActiveEvents(tenantId?: string): Promise<WebhookEvent[]>;
    findByCategory(category: string, tenantId?: string): Promise<WebhookEvent[]>;
    update(id: string, dto: Partial<CreateWebhookEventDto>): Promise<WebhookEvent | null>;
    delete(id: string): Promise<boolean>;
    toggleActive(id: string, isActive: boolean): Promise<WebhookEvent | null>;
}

export const WEBHOOK_EVENT_REPOSITORY = 'IWebhookEventRepository';