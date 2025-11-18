import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { IWebhookEventRepository, WEBHOOK_EVENT_REPOSITORY } from '../repositories/webhook-event.repository.interface';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity';
import { IWebhookEventQueries } from './interfaces/webhook-event-queries.interface';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Injectable()
export class WebhookEventQueries implements IWebhookEventQueries {
    private readonly logger = new Logger(WebhookEventQueries.name);

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

    async findAllWebhookEventsByTenant(tenantId: string): Promise<WebhookEventDto[]> {
        const webhookEvents = await this.webhookEventRepository.findAllByTenantId(tenantId);
        return webhookEvents.map(webhookEvent => this.mapToDto(webhookEvent)!);
    }

    async findActiveWebhookEventsByTenant(tenantId: string): Promise<WebhookEventDto[]> {
        const webhookEvents = await this.webhookEventRepository.findActiveByTenantId(tenantId);
        return webhookEvents.map(webhookEvent => this.mapToDto(webhookEvent)!);
    }

    async findWebhookEventById(id: string, requestingUserTenantId?: string): Promise<WebhookEventDto> {
        const webhookEvent = await this.webhookEventRepository.findById(id);

        if (!webhookEvent) {
            throw new NotFoundException(`Webhook event with ID ${id} not found`);
        }

        if (
            requestingUserTenantId !== undefined &&
            webhookEvent.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot access webhook event from different tenant.');
        }

        const dto = this.mapToDto(webhookEvent);

        if (!dto) {
            throw new NotFoundException(`Webhook event with ID ${id} could not be mapped`);
        }

        return dto;
    }

    async findWebhookEventByName(name: string, tenantId: string): Promise<WebhookEventDto | null> {
        const webhookEvent = await this.webhookEventRepository.findByName(name, tenantId);
        return this.mapToDto(webhookEvent);
    }
}