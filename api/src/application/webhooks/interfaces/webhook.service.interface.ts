import { WebhookDto } from '../dto/webhook.dto';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import { WebhookLogDto } from '../dto/webhook-log.dto';
import { PaginatedResponseDto, PaginationParamsDto } from '../../invoices/dto/pagination.dto';

export const WEBHOOK_SERVICE = 'WEBHOOK_SERVICE';

export interface IWebhookService {
    findAll(tenantId: string, paginationParams: PaginationParamsDto): Promise<PaginatedResponseDto<WebhookDto>>;
    findById(id: string, tenantId: string): Promise<WebhookDto>;
    create(createWebhookDto: CreateWebhookDto, tenantId: string): Promise<WebhookDto>;
    update(id: string, updateWebhookDto: UpdateWebhookDto, tenantId: string): Promise<WebhookDto>;
    remove(id: string, tenantId: string): Promise<void>;
    getLogs(webhookId: string, tenantId: string, paginationParams: PaginationParamsDto): Promise<PaginatedResponseDto<WebhookLogDto>>;
    toggleStatus(id: string, tenantId: string): Promise<WebhookDto>;
}