import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';
import { IWebhookEventRepository } from '../../../application/repositories/webhook.repository';

@Injectable()
export class WebhookEventRepository implements IWebhookEventRepository {
    private readonly logger = new Logger(WebhookEventRepository.name);

    constructor(
        @InjectRepository(WebhookEvent)
        private readonly ormRepository: Repository<WebhookEvent>,
    ) {}

    async findById(id: string): Promise<WebhookEvent | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['webhook'],
        });
    }

    async findByWebhookId(webhookId: string): Promise<WebhookEvent[]> {
        return this.ormRepository.find({
            where: { webhookId },
            relations: ['webhook'],
            order: { createdAt: 'DESC' },
        });
    }

    async create(
        webhookId: string,
        eventType: string,
        description?: string,
        payload?: Record<string, any>,
    ): Promise<WebhookEvent> {
        const webhookEvent = this.ormRepository.create({
            webhookId,
            eventType,
            description,
            payload,
            isActive: true,
        });

        return await this.ormRepository.save(webhookEvent);
    }

    async update(id: string, data: Partial<WebhookEvent>): Promise<WebhookEvent | null> {
        const webhookEvent = await this.findById(id);

        if (!webhookEvent) {
            this.logger.warn(`WebhookEvent with ID ${id} not found for update.`);
            return null;
        }

        this.ormRepository.merge(webhookEvent, data);
        return await this.ormRepository.save(webhookEvent);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async deleteByWebhookId(webhookId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ webhookId });
        return !!result?.affected && result.affected > 0;
    }
}