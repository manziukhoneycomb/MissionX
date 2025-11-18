import { WebhookDto } from '../dto/webhook.dto';

export interface IWebhookQueries {
    findAllWebhooksByTenant(tenantId: string): Promise<WebhookDto[]>;
    findActiveWebhooksByTenant(tenantId: string): Promise<WebhookDto[]>;
    findWebhookById(id: string, requestingUserTenantId?: string): Promise<WebhookDto>;
    findWebhooksByEventType(eventType: string, tenantId: string): Promise<WebhookDto[]>;
}

export const WEBHOOK_QUERIES = 'IWebhookQueries';