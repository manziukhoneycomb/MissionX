import { Injectable, NotFoundException, Inject, Optional } from '@nestjs/common';
import { IWebhookService } from './interfaces/webhook.service.interface';
import { IWebhookRepository, IWebhookLogRepository } from '../repositories/webhook.repository.interface';
import { WebhookDto } from './dto/webhook.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookLogDto } from './dto/webhook-log.dto';
import { PaginatedResponseDto, PaginationParamsDto } from '../invoices/dto/pagination.dto';
import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookMapper } from './webhook.mapper';

export const WEBHOOK_REPOSITORY = 'WEBHOOK_REPOSITORY';
export const WEBHOOK_LOG_REPOSITORY = 'WEBHOOK_LOG_REPOSITORY';

@Injectable()
export class WebhookService implements IWebhookService {
    constructor(
        @Optional() @Inject(WEBHOOK_REPOSITORY)
        private readonly webhookRepository: IWebhookRepository,
        @Optional() @Inject(WEBHOOK_LOG_REPOSITORY)
        private readonly webhookLogRepository: IWebhookLogRepository,
        private readonly webhookMapper: WebhookMapper,
    ) {}

    async findAll(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<WebhookDto>> {
        const [webhooks, total] = await this.webhookRepository.findAll(tenantId, paginationParams);

        return this.webhookMapper.toPaginatedResponse(
            webhooks,
            total,
            paginationParams.page ?? 1,
            paginationParams.limit ?? 10,
        );
    }

    async findById(id: string, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.findById(id, tenantId);

        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        return this.webhookMapper.toDto(webhook);
    }

    async create(createWebhookDto: CreateWebhookDto, tenantId: string): Promise<WebhookDto> {
        const webhook = new Webhook();
        webhook.url = createWebhookDto.url;
        webhook.method = createWebhookDto.method;
        webhook.events = createWebhookDto.events;
        webhook.isActive = true;
        webhook.secret = createWebhookDto.secret;
        webhook.headers = createWebhookDto.headers || {};
        webhook.retryPolicy = createWebhookDto.retryPolicy || {};
        webhook.timeout = createWebhookDto.timeout;
        webhook.maxRetries = createWebhookDto.maxRetries;
        webhook.tenantId = tenantId;

        const savedWebhook = await this.webhookRepository.save(webhook);
        return this.webhookMapper.toDto(savedWebhook);
    }

    async update(id: string, updateWebhookDto: UpdateWebhookDto, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.findById(id, tenantId);

        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        if (updateWebhookDto.url !== undefined) {
            webhook.url = updateWebhookDto.url;
        }
        if (updateWebhookDto.method !== undefined) {
            webhook.method = updateWebhookDto.method;
        }
        if (updateWebhookDto.events !== undefined) {
            webhook.events = updateWebhookDto.events;
        }
        if (updateWebhookDto.secret !== undefined) {
            webhook.secret = updateWebhookDto.secret;
        }
        if (updateWebhookDto.headers !== undefined) {
            webhook.headers = updateWebhookDto.headers;
        }
        if (updateWebhookDto.retryPolicy !== undefined) {
            webhook.retryPolicy = updateWebhookDto.retryPolicy;
        }
        if (updateWebhookDto.timeout !== undefined) {
            webhook.timeout = updateWebhookDto.timeout;
        }
        if (updateWebhookDto.maxRetries !== undefined) {
            webhook.maxRetries = updateWebhookDto.maxRetries;
        }

        const updatedWebhook = await this.webhookRepository.save(webhook);
        return this.webhookMapper.toDto(updatedWebhook);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const webhook = await this.webhookRepository.findById(id, tenantId);

        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        await this.webhookRepository.remove(id, tenantId);
    }

    async getLogs(
        webhookId: string,
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<WebhookLogDto>> {
        // First verify webhook exists and belongs to tenant
        const webhook = await this.webhookRepository.findById(webhookId, tenantId);
        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${webhookId} not found`);
        }

        const [logs, total] = await this.webhookLogRepository.findByWebhookId(
            webhookId,
            tenantId,
            paginationParams,
        );

        return this.webhookMapper.toLogPaginatedResponse(
            logs,
            total,
            paginationParams.page ?? 1,
            paginationParams.limit ?? 10,
        );
    }

    async toggleStatus(id: string, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.findById(id, tenantId);

        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        webhook.isActive = !webhook.isActive;
        const updatedWebhook = await this.webhookRepository.save(webhook);
        return this.webhookMapper.toDto(updatedWebhook);
    }

    async findWebhooksByEvents(events: string[], tenantId: string): Promise<Webhook[]> {
        return this.webhookRepository.findByEvents(events, tenantId);
    }
}