import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IWebhookService } from './interfaces/webhook.service.interface';
import {
    IWebhookRepository,
    IWebhookLogRepository,
    WEBHOOK_REPOSITORY,
    WEBHOOK_LOG_REPOSITORY,
} from '../repositories/webhook.repository';
import { WebhookDto } from './dto/webhook.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';

@Injectable()
export class WebhookService implements IWebhookService {
    constructor(
        @Inject(WEBHOOK_REPOSITORY)
        private readonly webhookRepository: IWebhookRepository,
        @Inject(WEBHOOK_LOG_REPOSITORY)
        private readonly webhookLogRepository: IWebhookLogRepository,
    ) {}

    async findAll(tenantId: string): Promise<WebhookDto[]> {
        const webhooks = await this.webhookRepository.findAllByTenantId(tenantId);
        return webhooks.map(this.toDto);
    }

    async findById(id: string, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.findByIdAndTenantId(id, tenantId);
        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }
        return this.toDto(webhook);
    }

    async create(dto: CreateWebhookDto, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.create(dto, tenantId);
        return this.toDto(webhook);
    }

    async update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.update(id, dto, tenantId);
        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }
        return this.toDto(webhook);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        const deleted = await this.webhookRepository.delete(id, tenantId);
        if (!deleted) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }
    }

    async activate(id: string, tenantId: string): Promise<void> {
        await this.webhookRepository.activate(id, tenantId);
    }

    async deactivate(id: string, tenantId: string): Promise<void> {
        await this.webhookRepository.deactivate(id, tenantId);
    }

    async getDeliveryLogs(
        id: string,
        tenantId: string,
        limit = 50,
        offset = 0,
    ): Promise<WebhookLog[]> {
        const webhook = await this.webhookRepository.findByIdAndTenantId(id, tenantId);
        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        return this.webhookLogRepository.findByWebhookIdAndTenantId(id, tenantId, limit, offset);
    }

    async triggerWebhook(eventType: string, payload: any, tenantId: string): Promise<void> {
        const webhooks = await this.webhookRepository.findByEventType(eventType, tenantId);
        
        for (const webhook of webhooks) {
            if (webhook.isActive) {
                await this.webhookLogRepository.create(
                    webhook.id,
                    eventType,
                    JSON.stringify(payload),
                );
            }
        }
    }

    private toDto(webhook: any): WebhookDto {
        return {
            id: webhook.id,
            url: webhook.url,
            method: webhook.method,
            events: webhook.events,
            isActive: webhook.isActive,
            secret: webhook.secret,
            headers: webhook.headers,
            retryPolicy: webhook.retryPolicy,
            timeout: webhook.timeout,
            maxRetries: webhook.maxRetries,
            tenantId: webhook.tenantId,
            createdAt: webhook.createdAt,
            updatedAt: webhook.updatedAt,
        };
    }
}