import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WebhookLog } from '../../../domain/entities/webhook-log.entity';
import { IWebhookLogRepository } from '../../../application/repositories/webhook-log.repository.interface';

@Injectable()
export class WebhookLogRepository implements IWebhookLogRepository {
    constructor(
        @InjectRepository(WebhookLog)
        private readonly repository: Repository<WebhookLog>,
    ) {}

    async create(log: Partial<WebhookLog>): Promise<WebhookLog> {
        const webhookLog = this.repository.create(log);
        return await this.repository.save(webhookLog);
    }

    async findAll(tenantId: string, limit: number = 100, offset: number = 0): Promise<WebhookLog[]> {
        return await this.repository.find({
            where: { tenantId },
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findByWebhookId(webhookId: string, tenantId: string, limit: number = 100, offset: number = 0): Promise<WebhookLog[]> {
        return await this.repository.find({
            where: { webhookId, tenantId },
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findByEventType(eventType: string, tenantId: string, limit: number = 100, offset: number = 0): Promise<WebhookLog[]> {
        return await this.repository.find({
            where: { eventType, tenantId },
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findByStatus(status: string, tenantId: string, limit: number = 100, offset: number = 0): Promise<WebhookLog[]> {
        return await this.repository.find({
            where: { status, tenantId },
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async findPendingRetries(): Promise<WebhookLog[]> {
        return await this.repository
            .createQueryBuilder('log')
            .where('log.status = :status', { status: 'retrying' })
            .andWhere('log.nextRetryAt <= :now', { now: new Date() })
            .leftJoinAndSelect('log.webhook', 'webhook')
            .leftJoinAndSelect('log.tenant', 'tenant')
            .orderBy('log.nextRetryAt', 'ASC')
            .getMany();
    }

    async update(id: string, updates: Partial<WebhookLog>): Promise<WebhookLog | null> {
        const log = await this.repository.findOne({ where: { id } });
        if (!log) {
            return null;
        }

        Object.assign(log, updates);
        return await this.repository.save(log);
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.repository.delete({ id, tenantId });
        return result.affected > 0;
    }

    async deleteOldLogs(beforeDate: Date, tenantId: string): Promise<number> {
        const result = await this.repository.delete({
            tenantId,
            createdAt: LessThan(beforeDate),
        });
        return result.affected || 0;
    }
}