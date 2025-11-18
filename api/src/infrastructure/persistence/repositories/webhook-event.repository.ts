import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';
import { IWebhookEventRepository } from '../../../application/repositories/webhook-event.repository.interface';
import { CreateWebhookEventDto } from '../../../application/webhooks/dto/create-webhook-event.dto';

@Injectable()
export class WebhookEventRepository implements IWebhookEventRepository {
    constructor(
        @InjectRepository(WebhookEvent)
        private readonly repository: Repository<WebhookEvent>,
    ) {}

    async create(dto: CreateWebhookEventDto, tenantId?: string): Promise<WebhookEvent> {
        const event = this.repository.create({
            ...dto,
            tenantId,
        });
        return await this.repository.save(event);
    }

    async findAll(tenantId?: string): Promise<WebhookEvent[]> {
        const query = this.repository.createQueryBuilder('event')
            .leftJoinAndSelect('event.tenant', 'tenant')
            .orderBy('event.createdAt', 'DESC');

        if (tenantId) {
            query.where('event.tenantId = :tenantId OR event.tenantId IS NULL', { tenantId });
        } else {
            query.where('event.tenantId IS NULL');
        }

        return await query.getMany();
    }

    async findById(id: string): Promise<WebhookEvent | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['tenant'],
        });
    }

    async findByEventType(eventType: string, tenantId?: string): Promise<WebhookEvent | null> {
        const query = this.repository.createQueryBuilder('event')
            .where('event.eventType = :eventType', { eventType })
            .leftJoinAndSelect('event.tenant', 'tenant');

        if (tenantId) {
            query.andWhere('(event.tenantId = :tenantId OR event.tenantId IS NULL)', { tenantId });
        } else {
            query.andWhere('event.tenantId IS NULL');
        }

        return await query.getOne();
    }

    async findActiveEvents(tenantId?: string): Promise<WebhookEvent[]> {
        const query = this.repository.createQueryBuilder('event')
            .where('event.isActive = :isActive', { isActive: true })
            .leftJoinAndSelect('event.tenant', 'tenant')
            .orderBy('event.eventType', 'ASC');

        if (tenantId) {
            query.andWhere('(event.tenantId = :tenantId OR event.tenantId IS NULL)', { tenantId });
        } else {
            query.andWhere('event.tenantId IS NULL');
        }

        return await query.getMany();
    }

    async findByCategory(category: string, tenantId?: string): Promise<WebhookEvent[]> {
        const query = this.repository.createQueryBuilder('event')
            .where('event.category = :category', { category })
            .leftJoinAndSelect('event.tenant', 'tenant')
            .orderBy('event.eventType', 'ASC');

        if (tenantId) {
            query.andWhere('(event.tenantId = :tenantId OR event.tenantId IS NULL)', { tenantId });
        } else {
            query.andWhere('event.tenantId IS NULL');
        }

        return await query.getMany();
    }

    async update(id: string, dto: Partial<CreateWebhookEventDto>): Promise<WebhookEvent | null> {
        const event = await this.findById(id);
        if (!event) {
            return null;
        }

        Object.assign(event, dto);
        return await this.repository.save(event);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }

    async toggleActive(id: string, isActive: boolean): Promise<WebhookEvent | null> {
        const event = await this.findById(id);
        if (!event) {
            return null;
        }

        event.isActive = isActive;
        return await this.repository.save(event);
    }
}