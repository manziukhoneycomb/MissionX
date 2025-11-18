import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWebhookRepository, WEBHOOK_REPOSITORY } from '../repositories/webhook.repository.interface';
import { IWebhookEventRepository, WEBHOOK_EVENT_REPOSITORY } from '../repositories/webhook-event.repository.interface';
import { IWebhookLogRepository, WEBHOOK_LOG_REPOSITORY } from '../repositories/webhook-log.repository.interface';
import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { IWebhookQueries } from './interfaces/webhook-queries.interface';
import { WebhookDto } from './dto/webhook.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { WebhookLogDto } from './dto/webhook-log.dto';

@Injectable()
export class WebhookQueries implements IWebhookQueries {
    constructor(
        @Inject(WEBHOOK_REPOSITORY)
        private readonly webhookRepository: IWebhookRepository,
        @Inject(WEBHOOK_EVENT_REPOSITORY)
        private readonly webhookEventRepository: IWebhookEventRepository,
        @Inject(WEBHOOK_LOG_REPOSITORY)
        private readonly webhookLogRepository: IWebhookLogRepository,
    ) {}

    private mapWebhookToDto(webhook: Webhook): WebhookDto {
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

    private mapWebhookEventToDto(event: WebhookEvent): WebhookEventDto {
        const dto = new WebhookEventDto();

        dto.id = event.id;
        dto.eventType = event.eventType;
        dto.description = event.description;
        dto.isActive = event.isActive;
        dto.category = event.category;
        dto.schema = event.schema;
        dto.tenantId = event.tenantId;
        dto.createdAt = event.createdAt;
        dto.updatedAt = event.updatedAt;

        return dto;
    }

    private mapWebhookLogToDto(log: WebhookLog): WebhookLogDto {
        const dto = new WebhookLogDto();

        dto.id = log.id;
        dto.webhookId = log.webhookId;
        dto.eventType = log.eventType;
        dto.payload = log.payload;
        dto.status = log.status;
        dto.httpStatusCode = log.httpStatusCode;
        dto.response = log.response;
        dto.error = log.error;
        dto.attempts = log.attempts;
        dto.nextRetryAt = log.nextRetryAt;
        dto.duration = log.duration;
        dto.tenantId = log.tenantId;
        dto.createdAt = log.createdAt;

        return dto;
    }

    async findAllWebhooks(tenantId: string): Promise<WebhookDto[]> {
        const webhooks = await this.webhookRepository.findAll(tenantId);
        return webhooks.map(webhook => this.mapWebhookToDto(webhook));
    }

    async findWebhookById(id: string, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.findById(id, tenantId);
        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        return this.mapWebhookToDto(webhook);
    }

    async findWebhooksByEvents(events: string[], tenantId: string): Promise<WebhookDto[]> {
        const webhooks = await this.webhookRepository.findByEvents(events, tenantId);
        return webhooks.map(webhook => this.mapWebhookToDto(webhook));
    }

    async findWebhookLogs(webhookId?: string, tenantId?: string, limit: number = 100, offset: number = 0): Promise<WebhookLogDto[]> {
        let logs: WebhookLog[];

        if (webhookId && tenantId) {
            logs = await this.webhookLogRepository.findByWebhookId(webhookId, tenantId, limit, offset);
        } else if (tenantId) {
            logs = await this.webhookLogRepository.findAll(tenantId, limit, offset);
        } else {
            throw new Error('tenantId is required');
        }

        return logs.map(log => this.mapWebhookLogToDto(log));
    }

    async findAvailableEvents(tenantId?: string): Promise<WebhookEventDto[]> {
        const events = await this.webhookEventRepository.findActiveEvents(tenantId);
        return events.map(event => this.mapWebhookEventToDto(event));
    }
}