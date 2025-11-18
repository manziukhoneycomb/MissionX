import { Webhook } from '../../domain/entities/webhook.entity';
import { CreateWebhookDto } from '../webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../webhooks/dto/update-webhook.dto';

export interface IWebhookRepository {
    create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook>;
    findAll(tenantId: string): Promise<Webhook[]>;
    findById(id: string, tenantId: string): Promise<Webhook | null>;
    findByEvents(events: string[], tenantId: string): Promise<Webhook[]>;
    findActiveByEvents(events: string[], tenantId: string): Promise<Webhook[]>;
    update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<Webhook | null>;
    delete(id: string, tenantId: string): Promise<boolean>;
    toggleActive(id: string, isActive: boolean, tenantId: string): Promise<Webhook | null>;
}

export const WEBHOOK_REPOSITORY = 'IWebhookRepository';