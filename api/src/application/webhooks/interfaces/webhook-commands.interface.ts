import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import { WebhookDto } from '../dto/webhook.dto';

export interface IWebhookCommands {
    createWebhook(dto: CreateWebhookDto, tenantId: string): Promise<WebhookDto>;
    updateWebhook(
        id: string,
        dto: UpdateWebhookDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<WebhookDto>;
    deleteWebhook(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
    activateWebhook(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
    deactivateWebhook(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
}

export const WEBHOOK_COMMANDS = 'IWebhookCommands';