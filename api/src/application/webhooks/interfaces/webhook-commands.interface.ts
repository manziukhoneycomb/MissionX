import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import { WebhookDto } from '../dto/webhook.dto';

export interface IWebhookCommands {
    createWebhook(dto: CreateWebhookDto, tenantId: string): Promise<WebhookDto>;
    updateWebhook(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<WebhookDto>;
    deleteWebhook(id: string, tenantId: string): Promise<void>;
    toggleWebhook(id: string, isActive: boolean, tenantId: string): Promise<WebhookDto>;
}

export const WEBHOOK_COMMANDS = 'IWebhookCommands';