import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WebhookLog, WebhookLogStatus } from '../../../domain/entities/webhook-log.entity';
import { IWebhookLogRepository } from '../../../application/repositories/webhook.repository';

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
            relations: ['webhook'],
        });
    }

    async findByWebhookId(webhookId: string, limit = 50, offset = 0): Promise<WebhookLog[]> {
        return this.ormRepository.find({
            where: { webhookId },
            relations: ['webhook'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findByWebhookIdAndTenantId(
        webhookId: string,
        tenantId: string,
        limit = 50,
        offset = 0,
    ): Promise<WebhookLog[]> {
        return this.ormRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.webhook', 'webhook')
            .where('log.webhookId = :webhookId', { webhookId })
            .andWhere('webhook.tenantId = :tenantId', { tenantId })
            .orderBy('log.createdAt', 'DESC')
            .take(limit)
            .skip(offset)
            .getMany();
    }

    async findFailedLogs(tenantId?: string, limit = 100): Promise<WebhookLog[]> {
        const query = this.ormRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.webhook', 'webhook')
            .where('log.status = :status', { status: WebhookLogStatus.FAILED })
            .orderBy('log.createdAt', 'DESC')
            .take(limit);

        if (tenantId) {
            query.andWhere('webhook.tenantId = :tenantId', { tenantId });
        }

        return query.getMany();
    }

    async findLogsForRetry(): Promise<WebhookLog[]> {
        return this.ormRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.webhook', 'webhook')
            .where('log.status = :status', { status: WebhookLogStatus.RETRYING })
            .andWhere('log.nextRetryAt <= :now', { now: new Date() })
            .andWhere('webhook.isActive = :isActive', { isActive: true })
            .orderBy('log.nextRetryAt', 'ASC')
            .take(100)
            .getMany();
    }

    async create(webhookId: string, eventType: string, payload?: string): Promise<WebhookLog> {
        const webhookLog = this.ormRepository.create({
            webhookId,
            eventType,
            payload,
            status: WebhookLogStatus.PENDING,
            attemptCount: 0,
        });

        return await this.ormRepository.save(webhookLog);
    }

    async updateStatus(
        id: string,
        status: string,
        responseStatus?: number,
        responseBody?: string,
        responseHeaders?: Record<string, string>,
        errorMessage?: string,
    ): Promise<WebhookLog | null> {
        const webhookLog = await this.findById(id);

        if (!webhookLog) {
            this.logger.warn(`WebhookLog with ID ${id} not found for status update.`);
            return null;
        }

        webhookLog.status = status as WebhookLogStatus;
        webhookLog.responseStatus = responseStatus;
        webhookLog.responseBody = responseBody;
        webhookLog.responseHeaders = responseHeaders;
        webhookLog.errorMessage = errorMessage;

        return await this.ormRepository.save(webhookLog);
    }

    async incrementAttemptCount(id: string, nextRetryAt?: Date): Promise<void> {
        await this.ormRepository.increment({ id }, 'attemptCount', 1);

        if (nextRetryAt) {
            await this.ormRepository.update(id, { nextRetryAt });
        }
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async deleteOldLogs(olderThanDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await this.ormRepository.delete({
            createdAt: LessThan(cutoffDate),
        });

        return result?.affected || 0;
    }
}