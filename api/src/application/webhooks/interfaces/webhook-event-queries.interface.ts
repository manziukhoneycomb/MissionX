import { WebhookEventDto } from '../dto/webhook-event.dto';

export interface IWebhookEventQueries {
    findAllWebhookEventsByTenant(tenantId: string): Promise<WebhookEventDto[]>;
    findActiveWebhookEventsByTenant(tenantId: string): Promise<WebhookEventDto[]>;
    findWebhookEventById(id: string, requestingUserTenantId?: string): Promise<WebhookEventDto>;
    findWebhookEventByName(name: string, tenantId: string): Promise<WebhookEventDto | null>;
}

export const WEBHOOK_EVENT_QUERIES = 'IWebhookEventQueries';