import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { CreateWebhookDto } from '../webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../webhooks/dto/update-webhook.dto';

export interface IWebhookRepository {
    create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook>;
    findAll(tenantId: string): Promise<Webhook[]>;
    findById(id: string, tenantId: string): Promise<Webhook | null>;
    findByUrl(url: string, tenantId: string): Promise<Webhook | null>;
    findActiveByTenant(tenantId: string): Promise<Webhook[]>;
    update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<Webhook | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
}

export interface IWebhookEventRepository {
    create(webhookId: string, eventType: string, eventName: string, tenantId: string, description?: string): Promise<WebhookEvent>;
    findByWebhook(webhookId: string, tenantId: string): Promise<WebhookEvent[]>;
    findByEventType(eventType: string, tenantId: string): Promise<WebhookEvent[]>;
    update(id: string, eventType: string, eventName: string, description: string, tenantId: string): Promise<WebhookEvent | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    deleteByWebhook(webhookId: string, tenantId: string): Promise<boolean>;
}

export interface IWebhookLogRepository {
    create(webhookId: string, eventType: string, payload: Record<string, any>, tenantId: string): Promise<WebhookLog>;
    findByWebhook(webhookId: string, tenantId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    findPendingRetries(tenantId?: string): Promise<WebhookLog[]>;
    findByStatus(status: string, tenantId: string, limit?: number, offset?: number): Promise<WebhookLog[]>;
    updateStatus(id: string, status: string, httpStatus?: number, response?: string, errorMessage?: string): Promise<WebhookLog | null>;
    incrementAttempt(id: string, nextRetryAt?: Date): Promise<WebhookLog | null>;
    markDelivered(id: string): Promise<WebhookLog | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    cleanupOldLogs(olderThanDays: number, tenantId?: string): Promise<number>;
}

export const WEBHOOK_REPOSITORY = 'IWebhookRepository';
export const WEBHOOK_EVENT_REPOSITORY = 'IWebhookEventRepository';
export const WEBHOOK_LOG_REPOSITORY = 'IWebhookLogRepository';