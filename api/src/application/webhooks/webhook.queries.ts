import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { IWebhookRepository, WEBHOOK_REPOSITORY } from '../repositories/webhook.repository.interface';
import { Webhook } from '../../domain/entities/webhook.entity';
import { IWebhookQueries } from './interfaces/webhook-queries.interface';
import { WebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookQueries implements IWebhookQueries {
    private readonly logger = new Logger(WebhookQueries.name);

    constructor(
        @Inject(WEBHOOK_REPOSITORY)
        private readonly webhookRepository: IWebhookRepository,
    ) {}

    private mapToDto(webhook: Webhook | null): WebhookDto | null {
        if (!webhook) {
            return null;
        }

        const dto = new WebhookDto();
        dto.id = webhook.id;
        dto.url = webhook.url;
        dto.method = webhook.method;
        dto.events = webhook.events;
        dto.isActive = webhook.isActive;
        dto.headers = webhook.headers;
        dto.retryPolicy = webhook.retryPolicy;
        dto.timeout = webhook.timeout;
        dto.maxRetries = webhook.maxRetries;
        dto.tenantId = webhook.tenantId;
        dto.createdAt = webhook.createdAt;
        dto.updatedAt = webhook.updatedAt;

        return dto;
    }

    async findAllWebhooksByTenant(tenantId: string): Promise<WebhookDto[]> {
        const webhooks = await this.webhookRepository.findAllByTenantId(tenantId);
        return webhooks.map(webhook => this.mapToDto(webhook)!);
    }

    async findActiveWebhooksByTenant(tenantId: string): Promise<WebhookDto[]> {
        const webhooks = await this.webhookRepository.findActiveByTenantId(tenantId);
        return webhooks.map(webhook => this.mapToDto(webhook)!);
    }

    async findWebhookById(id: string, requestingUserTenantId?: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.findById(id);

        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        if (
            requestingUserTenantId !== undefined &&
            webhook.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot access webhook from different tenant.');
        }

        const dto = this.mapToDto(webhook);

        if (!dto) {
            throw new NotFoundException(`Webhook with ID ${id} could not be mapped`);
        }

        return dto;
    }

    async findWebhooksByEventType(eventType: string, tenantId: string): Promise<WebhookDto[]> {
        const webhooks = await this.webhookRepository.findByEventType(eventType, tenantId);
        return webhooks.map(webhook => this.mapToDto(webhook)!);
    }
}