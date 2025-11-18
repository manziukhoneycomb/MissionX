import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { CreateWebhookDto } from '../webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../webhooks/dto/update-webhook.dto';

export interface IWebhookRepository {
    findById(id: string): Promise<Webhook | null>;
    findByIdAndTenantId(id: string, tenantId: string): Promise<Webhook | null>;
    findAllByTenantId(tenantId: string): Promise<Webhook[]>;
    findActiveByTenantId(tenantId: string): Promise<Webhook[]>;
    findByEventType(eventType: string, tenantId: string): Promise<Webhook[]>;
    create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook>;
    update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<Webhook | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    activate(id: string, tenantId: string): Promise<void>;
    deactivate(id: string, tenantId: string): Promise<void>;
}

export interface IWebhookEventRepository {
    findById(id: string): Promise<WebhookEvent | null>;
    findByWebhookId(webhookId: string): Promise<WebhookEvent[]>;
    create(
        webhookId: string,
        eventType: string,
        description?: string,
        payload?: Record<string, any>,
    ): Promise<WebhookEvent>;
    update(id: string, data: Partial<WebhookEvent>): Promise<WebhookEvent | null>;
    delete(id: string): Promise<boolean>;
    deleteByWebhookId(webhookId: string): Promise<boolean>;
}

export interface IWebhookLogRepository {
    findById(id: string): Promise<WebhookLog | null>;
    findByWebhookId(webhookId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    findByWebhookIdAndTenantId(
        webhookId: string,
        tenantId: string,
        limit?: number,
        offset?: number,
    ): Promise<WebhookLog[]>;
    findFailedLogs(tenantId?: string, limit?: number): Promise<WebhookLog[]>;
    findLogsForRetry(): Promise<WebhookLog[]>;
    create(
        webhookId: string,
        eventType: string,
        payload?: string,
    ): Promise<WebhookLog>;
    updateStatus(
        id: string,
        status: string,
        responseStatus?: number,
        responseBody?: string,
        responseHeaders?: Record<string, string>,
        errorMessage?: string,
    ): Promise<WebhookLog | null>;
    incrementAttemptCount(id: string, nextRetryAt?: Date): Promise<void>;
    delete(id: string): Promise<boolean>;
    deleteOldLogs(olderThanDays: number): Promise<number>;
}

export const WEBHOOK_REPOSITORY = 'IWebhookRepository';
export const WEBHOOK_EVENT_REPOSITORY = 'IWebhookEventRepository';
export const WEBHOOK_LOG_REPOSITORY = 'IWebhookLogRepository';