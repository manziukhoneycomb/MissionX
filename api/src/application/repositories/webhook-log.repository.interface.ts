import { WebhookLog } from '../../domain/entities/webhook-log.entity';

export interface IWebhookLogRepository {
    findById(id: string): Promise<WebhookLog | null>;
    findByWebhookId(webhookId: string): Promise<WebhookLog[]>;
    findAllByTenantId(tenantId: string): Promise<WebhookLog[]>;
    findFailedLogs(tenantId: string): Promise<WebhookLog[]>;
    findRecentLogs(tenantId: string, limit?: number): Promise<WebhookLog[]>;
    create(
        webhookId: string,
        eventType: string,
        payload: Record<string, any>,
        tenantId: string,
    ): Promise<WebhookLog>;
    updateDeliveryStatus(
        id: string,
        statusCode: number,
        responseBody?: string,
        responseTime?: number,
        isSuccess?: boolean,
    ): Promise<WebhookLog | null>;
    updateError(
        id: string,
        errorMessage: string,
        retryCount: number,
    ): Promise<WebhookLog | null>;
    delete(id: string): Promise<boolean>;
}

export const WEBHOOK_LOG_REPOSITORY = 'IWebhookLogRepository';