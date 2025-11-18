import { CreateWebhookEventDto } from '../dto/create-webhook-event.dto';
import { UpdateWebhookEventDto } from '../dto/update-webhook-event.dto';
import { WebhookEventDto } from '../dto/webhook-event.dto';

export interface IWebhookEventCommands {
    createWebhookEvent(dto: CreateWebhookEventDto, tenantId: string): Promise<WebhookEventDto>;
    updateWebhookEvent(
        id: string,
        dto: UpdateWebhookEventDto,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<WebhookEventDto>;
    deleteWebhookEvent(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
    activateWebhookEvent(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
    deactivateWebhookEvent(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<void>;
}

export const WEBHOOK_EVENT_COMMANDS = 'IWebhookEventCommands';