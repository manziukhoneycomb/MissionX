import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';
import { IWebhookEventRepository } from '../../../application/repositories/webhook.repository';

@Injectable()
export class WebhookEventRepository implements IWebhookEventRepository {
    constructor(
        @InjectRepository(WebhookEvent)
        private readonly ormRepository: Repository<WebhookEvent>,
    ) {}

    async create(
        webhookId: string,
        eventType: string,
        eventName: string,
        tenantId: string,
        description?: string
    ): Promise<WebhookEvent> {
        const webhookEvent = this.ormRepository.create({
            webhookId,
            eventType,
            eventName,
            tenantId,
            description,
            isActive: true,
        });

        return this.ormRepository.save(webhookEvent);
    }

    async findByWebhook(webhookId: string, tenantId: string): Promise<WebhookEvent[]> {
        return this.ormRepository.find({
            where: { webhookId, tenantId },
            relations: ['webhook', 'tenant'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByEventType(eventType: string, tenantId: string): Promise<WebhookEvent[]> {
        return this.ormRepository.find({
            where: { eventType, tenantId, isActive: true },
            relations: ['webhook', 'tenant'],
        });
    }

    async update(
        id: string,
        eventType: string,
        eventName: string,
        description: string,
        tenantId: string
    ): Promise<WebhookEvent | null> {
        const result = await this.ormRepository.update(
            { id, tenantId },
            { eventType, eventName, description }
        );

        if (result.affected === 0) {
            return null;
        }

        return this.ormRepository.findOne({
            where: { id, tenantId },
            relations: ['webhook', 'tenant'],
        });
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ id, tenantId });
        return !!result?.affected && result.affected > 0;
    }

    async deleteByWebhook(webhookId: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ webhookId, tenantId });
        return !!result?.affected && result.affected > 0;
    }
}