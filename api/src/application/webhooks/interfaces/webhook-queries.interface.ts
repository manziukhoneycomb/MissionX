import { WebhookDto } from '../dto/webhook.dto';
import { WebhookEventDto } from '../dto/webhook-event.dto';
import { WebhookLogDto } from '../dto/webhook-log.dto';

export interface IWebhookQueries {
    findAllWebhooks(tenantId: string): Promise<WebhookDto[]>;
    findWebhookById(id: string, tenantId: string): Promise<WebhookDto>;
    findWebhooksByEvents(events: string[], tenantId: string): Promise<WebhookDto[]>;
    findWebhookLogs(webhookId?: string, tenantId?: string, limit?: number, offset?: number): Promise<WebhookLogDto[]>;
    findAvailableEvents(tenantId?: string): Promise<WebhookEventDto[]>;
}

export const WEBHOOK_QUERIES = 'IWebhookQueries';