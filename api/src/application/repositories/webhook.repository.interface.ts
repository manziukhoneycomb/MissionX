import { Webhook } from '../../domain/entities/webhook.entity';
import { CreateWebhookDto } from '../webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../webhooks/dto/update-webhook.dto';

export interface IWebhookRepository {
    findById(id: string): Promise<Webhook | null>;
    findAllByTenantId(tenantId: string): Promise<Webhook[]>;
    findActiveByTenantId(tenantId: string): Promise<Webhook[]>;
    findByEventType(eventType: string, tenantId: string): Promise<Webhook[]>;
    create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook>;
    update(id: string, dto: UpdateWebhookDto): Promise<Webhook | null>;
    delete(id: string): Promise<boolean>;
    activate(id: string): Promise<void>;
    deactivate(id: string): Promise<void>;
}

export const WEBHOOK_REPOSITORY = 'IWebhookRepository';