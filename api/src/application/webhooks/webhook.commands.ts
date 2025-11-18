import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IWebhookRepository, WEBHOOK_REPOSITORY } from '../repositories/webhook.repository.interface';
import { Webhook } from '../../domain/entities/webhook.entity';
import { IWebhookCommands } from './interfaces/webhook-commands.interface';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookCommands implements IWebhookCommands {
    constructor(
        @Inject(WEBHOOK_REPOSITORY)
        private readonly webhookRepository: IWebhookRepository,
    ) {}

    private mapToDto(webhook: Webhook): WebhookDto {
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

    async createWebhook(dto: CreateWebhookDto, tenantId: string): Promise<WebhookDto> {
        if (!dto.events || dto.events.length === 0) {
            throw new BadRequestException('Webhook must have at least one event type');
        }

        const webhook = await this.webhookRepository.create(dto, tenantId);
        return this.mapToDto(webhook);
    }

    async updateWebhook(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<WebhookDto> {
        if (Object.keys(dto).length === 0) {
            const webhook = await this.webhookRepository.findById(id, tenantId);
            if (!webhook) {
                throw new NotFoundException(`Webhook with ID ${id} not found`);
            }
            return this.mapToDto(webhook);
        }

        if (dto.events && dto.events.length === 0) {
            throw new BadRequestException('Webhook must have at least one event type');
        }

        const updatedWebhook = await this.webhookRepository.update(id, dto, tenantId);
        if (!updatedWebhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found or could not be updated`);
        }

        return this.mapToDto(updatedWebhook);
    }

    async deleteWebhook(id: string, tenantId: string): Promise<void> {
        const deleted = await this.webhookRepository.delete(id, tenantId);
        if (!deleted) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }
    }

    async toggleWebhook(id: string, isActive: boolean, tenantId: string): Promise<WebhookDto> {
        const webhook = await this.webhookRepository.toggleActive(id, isActive, tenantId);
        if (!webhook) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        return this.mapToDto(webhook);
    }
}