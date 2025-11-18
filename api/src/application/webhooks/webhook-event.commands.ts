import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { IWebhookEventRepository, WEBHOOK_EVENT_REPOSITORY } from '../repositories/webhook-event.repository.interface';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { IWebhookEventCommands } from './interfaces/webhook-event-commands.interface';
import { CreateWebhookEventDto } from './dto/create-webhook-event.dto';
import { UpdateWebhookEventDto } from './dto/update-webhook-event.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Injectable()
export class WebhookEventCommands implements IWebhookEventCommands {
    private readonly logger = new Logger(WebhookEventCommands.name);

    constructor(
        @Inject(WEBHOOK_EVENT_REPOSITORY)
        private readonly webhookEventRepository: IWebhookEventRepository,
    ) {}

    private mapToDto(webhookEvent: WebhookEvent | null): WebhookEventDto | null {
        if (!webhookEvent) {
            return null;
        }

        const dto = new WebhookEventDto();
        dto.id = webhookEvent.id;
        dto.name = webhookEvent.name;
        dto.description = webhookEvent.description;
        dto.schema = webhookEvent.schema;
        dto.isActive = webhookEvent.isActive;
        dto.tenantId = webhookEvent.tenantId;
        dto.createdAt = webhookEvent.createdAt;
        dto.updatedAt = webhookEvent.updatedAt;

        return dto;
    }

    async createWebhookEvent(dto: CreateWebhookEventDto, tenantId: string): Promise<WebhookEventDto> {
        const existingEvent = await this.webhookEventRepository.findByName(dto.name, tenantId);

        if (existingEvent) {
            throw new BadRequestException(`Webhook event with name '${dto.name}' already exists for this tenant`);
        }

        const createdWebhookEvent = await this.webhookEventRepository.create(dto, tenantId);

        this.logger.log(`Created webhook event ${createdWebhookEvent.id} (${dto.name}) for tenant ${tenantId}`);

        const webhookEventDto = this.mapToDto(createdWebhookEvent);

        if (!webhookEventDto) {
            this.logger.error(`Failed to map webhook event ID ${createdWebhookEvent.id} to DTO after creation.`);
            throw new InternalServerErrorException('Failed to map created webhook event.');
        }

        return webhookEventDto;
    }

    async updateWebhookEvent(
        id: string,
        dto: UpdateWebhookEventDto,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<WebhookEventDto> {
        const webhookEventToUpdate = await this.webhookEventRepository.findById(id);

        if (!webhookEventToUpdate) {
            throw new NotFoundException(`Webhook event with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookEventToUpdate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot update webhook event from different tenant.');
        }

        if (dto.name && dto.name !== webhookEventToUpdate.name) {
            const existingEvent = await this.webhookEventRepository.findByName(dto.name, webhookEventToUpdate.tenantId);
            if (existingEvent) {
                throw new BadRequestException(`Webhook event with name '${dto.name}' already exists for this tenant`);
            }
        }

        const updatedWebhookEvent = await this.webhookEventRepository.update(id, dto);

        if (!updatedWebhookEvent) {
            this.logger.error(`Webhook event update for ID ${id} returned null from repository.`);
            throw new InternalServerErrorException('Webhook event update failed unexpectedly.');
        }

        const updatedDto = this.mapToDto(updatedWebhookEvent);

        if (!updatedDto) {
            this.logger.error(`Failed to map updated webhook event ID ${id} to DTO.`);
            throw new InternalServerErrorException('Failed to map updated webhook event.');
        }

        this.logger.log(`Updated webhook event ${id} (${updatedWebhookEvent.name}) for tenant ${updatedWebhookEvent.tenantId}`);

        return updatedDto;
    }

    async deleteWebhookEvent(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const webhookEventToDelete = await this.webhookEventRepository.findById(id);

        if (!webhookEventToDelete) {
            throw new NotFoundException(`Webhook event with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookEventToDelete.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot delete webhook event from different tenant.');
        }

        const deleted = await this.webhookEventRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(
                `Webhook event with ID ${id} could not be deleted, potentially already deleted.`,
            );
        }

        this.logger.log(`Successfully deleted webhook event ID: ${id}`);
    }

    async activateWebhookEvent(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const webhookEventToActivate = await this.webhookEventRepository.findById(id);

        if (!webhookEventToActivate) {
            throw new NotFoundException(`Webhook event with ID ${id} not found.`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookEventToActivate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot activate webhook event from a different tenant.');
        }

        await this.webhookEventRepository.activate(id);
        this.logger.log(`Activated webhook event ID: ${id}`);
    }

    async deactivateWebhookEvent(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const webhookEventToDeactivate = await this.webhookEventRepository.findById(id);

        if (!webhookEventToDeactivate) {
            throw new NotFoundException(`Webhook event with ID ${id} not found.`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            webhookEventToDeactivate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot deactivate webhook event from a different tenant.');
        }

        await this.webhookEventRepository.deactivate(id);
        this.logger.log(`Deactivated webhook event ID: ${id}`);
    }
}