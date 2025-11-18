import { WebhookLogDto } from '../dto/webhook-log.dto';

export interface IWebhookLogQueries {
    findAllWebhookLogsByTenant(tenantId: string): Promise<WebhookLogDto[]>;
    findWebhookLogsByWebhookId(webhookId: string, requestingUserTenantId?: string): Promise<WebhookLogDto[]>;
    findFailedWebhookLogs(tenantId: string): Promise<WebhookLogDto[]>;
    findRecentWebhookLogs(tenantId: string, limit?: number): Promise<WebhookLogDto[]>;
    findWebhookLogById(id: string, requestingUserTenantId?: string): Promise<WebhookLogDto>;
}

export const WEBHOOK_LOG_QUERIES = 'IWebhookLogQueries';