import { Injectable } from '@nestjs/common';
import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { WebhookDto } from './dto/webhook.dto';
import { WebhookLogDto } from './dto/webhook-log.dto';
import { PaginatedResponseDto } from '../invoices/dto/pagination.dto';

@Injectable()
export class WebhookMapper {
    toDto(entity: Webhook): WebhookDto {
        const dto = new WebhookDto();
        dto.id = entity.id;
        dto.url = entity.url;
        dto.method = entity.method;
        dto.events = entity.events;
        dto.isActive = entity.isActive;
        dto.secret = entity.secret;
        dto.headers = entity.headers;
        dto.retryPolicy = entity.retryPolicy;
        dto.timeout = entity.timeout;
        dto.maxRetries = entity.maxRetries;
        dto.tenantId = entity.tenantId;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;

        return dto;
    }

    toDtoList(entities: Webhook[]): WebhookDto[] {
        return entities.map((entity) => this.toDto(entity));
    }

    toPaginatedResponse(
        entities: Webhook[],
        total: number,
        page: number,
        limit: number,
    ): PaginatedResponseDto<WebhookDto> {
        const response = new PaginatedResponseDto<WebhookDto>();
        response.items = this.toDtoList(entities);
        response.total = total;
        response.page = page;
        response.limit = limit;
        response.totalPages = Math.ceil(total / limit);

        return response;
    }

    toLogDto(entity: WebhookLog): WebhookLogDto {
        const dto = new WebhookLogDto();
        dto.id = entity.id;
        dto.webhookId = entity.webhookId;
        dto.eventType = entity.eventType;
        dto.payload = entity.payload;
        dto.status = entity.status;
        dto.httpStatus = entity.httpStatus;
        dto.response = entity.response;
        dto.errorMessage = entity.errorMessage;
        dto.attemptCount = entity.attemptCount;
        dto.maxAttempts = entity.maxAttempts;
        dto.nextRetryAt = entity.nextRetryAt;
        dto.deliveredAt = entity.deliveredAt;
        dto.tenantId = entity.tenantId;
        dto.createdAt = entity.createdAt;

        return dto;
    }

    toLogDtoList(entities: WebhookLog[]): WebhookLogDto[] {
        return entities.map((entity) => this.toLogDto(entity));
    }

    toLogPaginatedResponse(
        entities: WebhookLog[],
        total: number,
        page: number,
        limit: number,
    ): PaginatedResponseDto<WebhookLogDto> {
        const response = new PaginatedResponseDto<WebhookLogDto>();
        response.items = this.toLogDtoList(entities);
        response.total = total;
        response.page = page;
        response.limit = limit;
        response.totalPages = Math.ceil(total / limit);

        return response;
    }
}