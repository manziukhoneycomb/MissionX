import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { IWebhookRepository, WEBHOOK_REPOSITORY } from '../repositories/webhook.repository.interface';
import { Webhook } from '../../domain/entities/webhook.entity';
import { IWebhookCommands } from './interfaces/webhook-commands.interface';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookCommands implements IWebhookCommands {
    private readonly logger = new Logger(WebhookCommands.name);

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

    async createWebhook(dto: CreateWebhookDto, tenantId: string): Promise<WebhookDto> {
        const createdWebhook = await this.webhookRepository.create(dto, tenantId);

        this.logger.log(`Created webhook ${createdWebhook.id} for tenant ${tenantId}`);

        const webhookDto = this.mapToDto(createdWebhook);

        if (!webhookDto) {
            this.logger.error(`Failed to map webhook ID ${createdWebhook.id} to DTO after creation.`);
            throw new InternalServerErrorException('Failed to map created webhook.');
        }

        return webhookDto;
    }

    async updateWebhook(
        id: string,
        dto: UpdateWebhookDto,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<WebhookDto> {
        const webhookToUpdate = await this.webhookRepository.findById(id);

        if (!webhookToUpdate) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookToUpdate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot update webhook from different tenant.');
        }

        const updatedWebhook = await this.webhookRepository.update(id, dto);

        if (!updatedWebhook) {
            this.logger.error(`Webhook update for ID ${id} returned null from repository.`);
            throw new InternalServerErrorException('Webhook update failed unexpectedly.');
        }

        const updatedDto = this.mapToDto(updatedWebhook);

        if (!updatedDto) {
            this.logger.error(`Failed to map updated webhook ID ${id} to DTO.`);
            throw new InternalServerErrorException('Failed to map updated webhook.');
        }

        this.logger.log(`Updated webhook ${id} for tenant ${updatedWebhook.tenantId}`);

        return updatedDto;
    }

    async deleteWebhook(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const webhookToDelete = await this.webhookRepository.findById(id);

        if (!webhookToDelete) {
            throw new NotFoundException(`Webhook with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookToDelete.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot delete webhook from different tenant.');
        }

        const deleted = await this.webhookRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(
                `Webhook with ID ${id} could not be deleted, potentially already deleted.`,
            );
        }

        this.logger.log(`Successfully deleted webhook ID: ${id}`);
    }

    async activateWebhook(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const webhookToActivate = await this.webhookRepository.findById(id);

        if (!webhookToActivate) {
            throw new NotFoundException(`Webhook with ID ${id} not found.`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookToActivate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot activate webhook from a different tenant.');
        }

        await this.webhookRepository.activate(id);
        this.logger.log(`Activated webhook ID: ${id}`);
    }

    async deactivateWebhook(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const webhookToDeactivate = await this.webhookRepository.findById(id);

        if (!webhookToDeactivate) {
            throw new NotFoundException(`Webhook with ID ${id} not found.`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookToDeactivate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot deactivate webhook from a different tenant.');
        }

        await this.webhookRepository.deactivate(id);
        this.logger.log(`Deactivated webhook ID: ${id}`);
    }
}