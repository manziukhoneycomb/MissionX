import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookLog } from '../../../domain/entities/webhook-log.entity';
import { IWebhookLogRepository } from '../../../application/repositories/webhook-log.repository.interface';

@Injectable()
export class WebhookLogRepository implements IWebhookLogRepository {
    private readonly logger = new Logger(WebhookLogRepository.name);

    constructor(
        @InjectRepository(WebhookLog)
        private readonly ormRepository: Repository<WebhookLog>,
    ) {}

    async findById(id: string): Promise<WebhookLog | null> {
        return this.ormRepository.findOne({ 
            where: { id }, 
            relations: ['webhook', 'tenant'] 
        });
    }

    async findByWebhookId(webhookId: string): Promise<WebhookLog[]> {
        return this.ormRepository.find({ 
            where: { webhookId }, 
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findAllByTenantId(tenantId: string): Promise<WebhookLog[]> {
        return this.ormRepository.find({ 
            where: { tenantId }, 
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findFailedLogs(tenantId: string): Promise<WebhookLog[]> {
        return this.ormRepository.find({ 
            where: { tenantId, isSuccess: false }, 
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findRecentLogs(tenantId: string, limit: number = 100): Promise<WebhookLog[]> {
        return this.ormRepository.find({ 
            where: { tenantId }, 
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
            take: limit
        });
    }

    async create(
        webhookId: string,
        eventType: string,
        payload: Record<string, any>,
        tenantId: string,
    ): Promise<WebhookLog> {
        const webhookLog = this.ormRepository.create({
            webhookId,
            eventType,
            payload,
            tenantId,
            statusCode: 0,
            retryCount: 0,
            isSuccess: false,
        });

        return await this.ormRepository.save(webhookLog);
    }

    async updateDeliveryStatus(
        id: string,
        statusCode: number,
        responseBody?: string,
        responseTime?: number,
        isSuccess?: boolean,
    ): Promise<WebhookLog | null> {
        const webhookLog = await this.findById(id);

        if (!webhookLog) {
            this.logger.warn(`WebhookLog with ID ${id} not found for update.`);
            return null;
        }

        webhookLog.statusCode = statusCode;
        if (responseBody !== undefined) {
            webhookLog.responseBody = responseBody;
        }
        if (responseTime !== undefined) {
            webhookLog.responseTime = responseTime;
        }
        if (isSuccess !== undefined) {
            webhookLog.isSuccess = isSuccess;
        } else {
            webhookLog.isSuccess = statusCode >= 200 && statusCode < 300;
        }

        return await this.ormRepository.save(webhookLog);
    }

    async updateError(
        id: string,
        errorMessage: string,
        retryCount: number,
    ): Promise<WebhookLog | null> {
        const webhookLog = await this.findById(id);

        if (!webhookLog) {
            this.logger.warn(`WebhookLog with ID ${id} not found for error update.`);
            return null;
        }

        webhookLog.errorMessage = errorMessage;
        webhookLog.retryCount = retryCount;
        webhookLog.isSuccess = false;

        return await this.ormRepository.save(webhookLog);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }
}