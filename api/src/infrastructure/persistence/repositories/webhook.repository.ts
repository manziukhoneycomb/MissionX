import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../../../domain/entities/webhook.entity';
import { IWebhookRepository } from '../../../application/repositories/webhook.repository.interface';
import { CreateWebhookDto } from '../../../application/webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../../../application/webhooks/dto/update-webhook.dto';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
    private readonly logger = new Logger(WebhookRepository.name);

    constructor(
        @InjectRepository(Webhook)
        private readonly ormRepository: Repository<Webhook>,
    ) {}

    async findById(id: string): Promise<Webhook | null> {
        return this.ormRepository.findOne({ 
            where: { id }, 
            relations: ['tenant'] 
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Webhook[]> {
        return this.ormRepository.find({ 
            where: { tenantId }, 
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findActiveByTenantId(tenantId: string): Promise<Webhook[]> {
        return this.ormRepository.find({ 
            where: { tenantId, isActive: true }, 
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByEventType(eventType: string, tenantId: string): Promise<Webhook[]> {
        return this.ormRepository
            .createQueryBuilder('webhook')
            .where('webhook.tenantId = :tenantId', { tenantId })
            .andWhere('webhook.isActive = :isActive', { isActive: true })
            .andWhere('JSON_CONTAINS(webhook.events, :eventType)', { 
                eventType: JSON.stringify(eventType) 
            })
            .leftJoinAndSelect('webhook.tenant', 'tenant')
            .getMany();
    }

    async create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook> {
        const webhook = this.ormRepository.create({
            ...dto,
            tenantId,
        });

        return await this.ormRepository.save(webhook);
    }

    async update(id: string, dto: UpdateWebhookDto): Promise<Webhook | null> {
        const webhook = await this.findById(id);

        if (!webhook) {
            this.logger.warn(`Webhook with ID ${id} not found for update.`);
            return null;
        }

        this.ormRepository.merge(webhook, dto);
        return await this.ormRepository.save(webhook);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async activate(id: string): Promise<void> {
        const webhook = await this.findById(id);

        if (!webhook) {
            return;
        }

        webhook.isActive = true;
        await this.ormRepository.save(webhook);
    }

    async deactivate(id: string): Promise<void> {
        const webhook = await this.findById(id);

        if (!webhook) {
            return;
        }

        webhook.isActive = false;
        await this.ormRepository.save(webhook);
    }
}