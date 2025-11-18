import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { PaginationParamsDto } from '../invoices/dto/pagination.dto';

export interface IWebhookRepository {
    findAll(tenantId: string, paginationParams: PaginationParamsDto): Promise<[Webhook[], number]>;
    findById(id: string, tenantId: string): Promise<Webhook | null>;
    save(webhook: Webhook): Promise<Webhook>;
    remove(id: string, tenantId: string): Promise<void>;
    findByEvents(events: string[], tenantId: string): Promise<Webhook[]>;
}

export interface IWebhookLogRepository {
    findByWebhookId(webhookId: string, tenantId: string, paginationParams: PaginationParamsDto): Promise<[WebhookLog[], number]>;
    save(webhookLog: WebhookLog): Promise<WebhookLog>;
    findPendingDeliveries(): Promise<WebhookLog[]>;
}