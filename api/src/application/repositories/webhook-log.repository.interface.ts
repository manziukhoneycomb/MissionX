import { WebhookLog } from '../../domain/entities/webhook-log.entity';

export interface IWebhookLogRepository {
    create(log: Partial<WebhookLog>): Promise<WebhookLog>;
    findAll(tenantId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    findByWebhookId(webhookId: string, tenantId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    findByEventType(eventType: string, tenantId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    findByStatus(status: string, tenantId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    findPendingRetries(): Promise<WebhookLog[]>;
    update(id: string, updates: Partial<WebhookLog>): Promise<WebhookLog | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    deleteOldLogs(beforeDate: Date, tenantId: string): Promise<number>;
}

export const WEBHOOK_LOG_REPOSITORY = 'IWebhookLogRepository';