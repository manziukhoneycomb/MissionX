import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WebhookLog } from '../../../domain/entities/webhook-log.entity';
import { IWebhookLogRepository } from '../../../application/repositories/webhook.repository';

@Injectable()
export class WebhookLogRepository implements IWebhookLogRepository {
    constructor(
        @InjectRepository(WebhookLog)
        private readonly ormRepository: Repository<WebhookLog>,
    ) {}

    async create(
        webhookId: string,
        eventType: string,
        payload: Record<string, any>,
        tenantId: string
    ): Promise<WebhookLog> {
        const webhookLog = this.ormRepository.create({
            webhookId,
            eventType,
            payload,
            tenantId,
            status: 'pending',
            attemptCount: 0,
            maxAttempts: 3,
        });

        return this.ormRepository.save(webhookLog);
    }

    async findByWebhook(
        webhookId: string,
        tenantId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<WebhookLog[]> {
        return this.ormRepository.find({
            where: { webhookId, tenantId },
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findPendingRetries(tenantId?: string): Promise<WebhookLog[]> {
        const whereCondition: any = {
            status: 'pending',
            nextRetryAt: LessThan(new Date()),
        };

        if (tenantId) {
            whereCondition.tenantId = tenantId;
        }

        return this.ormRepository.find({
            where: whereCondition,
            relations: ['webhook'],
            order: { nextRetryAt: 'ASC' },
        });
    }

    async findByStatus(
        status: string,
        tenantId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<WebhookLog[]> {
        return this.ormRepository.find({
            where: { status, tenantId },
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async updateStatus(
        id: string,
        status: string,
        httpStatus?: number,
        response?: string,
        errorMessage?: string
    ): Promise<WebhookLog | null> {
        const updateData: any = { status };

        if (httpStatus !== undefined) {
            updateData.httpStatus = httpStatus;
        }

        if (response !== undefined) {
            updateData.response = response;
        }

        if (errorMessage !== undefined) {
            updateData.errorMessage = errorMessage;
        }

        const result = await this.ormRepository.update(id, updateData);

        if (result.affected === 0) {
            return null;
        }

        return this.ormRepository.findOne({
            where: { id },
            relations: ['webhook', 'tenant'],
        });
    }

    async incrementAttempt(id: string, nextRetryAt?: Date): Promise<WebhookLog | null> {
        const log = await this.ormRepository.findOne({ where: { id } });
        
        if (!log) {
            return null;
        }

        const updateData: any = {
            attemptCount: log.attemptCount + 1,
        };

        if (nextRetryAt) {
            updateData.nextRetryAt = nextRetryAt;
        }

        const result = await this.ormRepository.update(id, updateData);

        if (result.affected === 0) {
            return null;
        }

        return this.ormRepository.findOne({
            where: { id },
            relations: ['webhook', 'tenant'],
        });
    }

    async markDelivered(id: string): Promise<WebhookLog | null> {
        const result = await this.ormRepository.update(id, {
            status: 'delivered',
            deliveredAt: new Date(),
        });

        if (result.affected === 0) {
            return null;
        }

        return this.ormRepository.findOne({
            where: { id },
            relations: ['webhook', 'tenant'],
        });
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ id, tenantId });
        return !!result?.affected && result.affected > 0;
    }

    async cleanupOldLogs(olderThanDays: number, tenantId?: string): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const whereCondition: any = {
            createdAt: LessThan(cutoffDate),
        };

        if (tenantId) {
            whereCondition.tenantId = tenantId;
        }

        const result = await this.ormRepository.delete(whereCondition);
        return result.affected || 0;
    }
}