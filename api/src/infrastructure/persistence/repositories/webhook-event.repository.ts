import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';
import { IWebhookEventRepository } from '../../../application/repositories/webhook-event.repository.interface';
import { CreateWebhookEventDto } from '../../../application/webhooks/dto/create-webhook-event.dto';
import { UpdateWebhookEventDto } from '../../../application/webhooks/dto/update-webhook-event.dto';

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
            relations: ['tenant'] 
        });
    }

    async findByName(name: string, tenantId: string): Promise<WebhookEvent | null> {
        return this.ormRepository.findOne({ 
            where: { name, tenantId }, 
            relations: ['tenant'] 
        });
    }

    async findAllByTenantId(tenantId: string): Promise<WebhookEvent[]> {
        return this.ormRepository.find({ 
            where: { tenantId }, 
            relations: ['tenant'],
            order: { name: 'ASC' }
        });
    }

    async findActiveByTenantId(tenantId: string): Promise<WebhookEvent[]> {
        return this.ormRepository.find({ 
            where: { tenantId, isActive: true }, 
            relations: ['tenant'],
            order: { name: 'ASC' }
        });
    }

    async create(dto: CreateWebhookEventDto, tenantId: string): Promise<WebhookEvent> {
        const webhookEvent = this.ormRepository.create({
            ...dto,
            tenantId,
        });

        return await this.ormRepository.save(webhookEvent);
    }

    async update(id: string, dto: UpdateWebhookEventDto): Promise<WebhookEvent | null> {
        const webhookEvent = await this.findById(id);

        if (!webhookEvent) {
            this.logger.warn(`WebhookEvent with ID ${id} not found for update.`);
            return null;
        }

        this.ormRepository.merge(webhookEvent, dto);
        return await this.ormRepository.save(webhookEvent);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async activate(id: string): Promise<void> {
        const webhookEvent = await this.findById(id);

        if (!webhookEvent) {
            return;
        }

        webhookEvent.isActive = true;
        await this.ormRepository.save(webhookEvent);
    }

    async deactivate(id: string): Promise<void> {
        const webhookEvent = await this.findById(id);

        if (!webhookEvent) {
            return;
        }

        webhookEvent.isActive = false;
        await this.ormRepository.save(webhookEvent);
    }
}