import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { IWebhookLogRepository, WEBHOOK_LOG_REPOSITORY } from '../repositories/webhook-log.repository.interface';
import { IWebhookRepository, WEBHOOK_REPOSITORY } from '../repositories/webhook.repository.interface';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { IWebhookLogQueries } from './interfaces/webhook-log-queries.interface';
import { WebhookLogDto } from './dto/webhook-log.dto';

@Injectable()
export class WebhookLogQueries implements IWebhookLogQueries {
    private readonly logger = new Logger(WebhookLogQueries.name);

    constructor(
        @Inject(WEBHOOK_LOG_REPOSITORY)
        private readonly webhookLogRepository: IWebhookLogRepository,
        @Inject(WEBHOOK_REPOSITORY)
        private readonly webhookRepository: IWebhookRepository,
    ) {}

    private mapToDto(webhookLog: WebhookLog | null): WebhookLogDto | null {
        if (!webhookLog) {
            return null;
        }

        const dto = new WebhookLogDto();
        dto.id = webhookLog.id;
        dto.webhookId = webhookLog.webhookId;
        dto.eventType = webhookLog.eventType;
        dto.payload = webhookLog.payload;
        dto.statusCode = webhookLog.statusCode;
        dto.responseBody = webhookLog.responseBody;
        dto.errorMessage = webhookLog.errorMessage;
        dto.retryCount = webhookLog.retryCount;
        dto.isSuccess = webhookLog.isSuccess;
        dto.responseTime = webhookLog.responseTime;
        dto.tenantId = webhookLog.tenantId;
        dto.createdAt = webhookLog.createdAt;

        return dto;
    }

    async findAllWebhookLogsByTenant(tenantId: string): Promise<WebhookLogDto[]> {
        const webhookLogs = await this.webhookLogRepository.findAllByTenantId(tenantId);
        return webhookLogs.map(webhookLog => this.mapToDto(webhookLog)!);
    }

    async findWebhookLogsByWebhookId(webhookId: string, requestingUserTenantId?: string): Promise<WebhookLogDto[]> {
        if (requestingUserTenantId) {
            const webhook = await this.webhookRepository.findById(webhookId);
            if (!webhook) {
                throw new NotFoundException(`Webhook with ID ${webhookId} not found`);
            }
            if (webhook.tenantId !== requestingUserTenantId) {
                throw new ForbiddenException('Cannot access webhook logs from different tenant.');
            }
        }

        const webhookLogs = await this.webhookLogRepository.findByWebhookId(webhookId);
        return webhookLogs.map(webhookLog => this.mapToDto(webhookLog)!);
    }

    async findFailedWebhookLogs(tenantId: string): Promise<WebhookLogDto[]> {
        const webhookLogs = await this.webhookLogRepository.findFailedLogs(tenantId);
        return webhookLogs.map(webhookLog => this.mapToDto(webhookLog)!);
    }

    async findRecentWebhookLogs(tenantId: string, limit?: number): Promise<WebhookLogDto[]> {
        const webhookLogs = await this.webhookLogRepository.findRecentLogs(tenantId, limit);
        return webhookLogs.map(webhookLog => this.mapToDto(webhookLog)!);
    }

    async findWebhookLogById(id: string, requestingUserTenantId?: string): Promise<WebhookLogDto> {
        const webhookLog = await this.webhookLogRepository.findById(id);

        if (!webhookLog) {
            throw new NotFoundException(`Webhook log with ID ${id} not found`);
        }

        if (
            requestingUserTenantId !== undefined &&
            webhookLog.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot access webhook log from different tenant.');
        }

        const dto = this.mapToDto(webhookLog);

        if (!dto) {
            throw new NotFoundException(`Webhook log with ID ${id} could not be mapped`);
        }

        return dto;
    }
}