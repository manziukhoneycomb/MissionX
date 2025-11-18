import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../../../domain/entities/webhook.entity';
import { IWebhookRepository } from '../../../application/repositories/webhook.repository';
import { CreateWebhookDto } from '../../../application/webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../../../application/webhooks/dto/update-webhook.dto';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
    constructor(
        @InjectRepository(Webhook)
        private readonly ormRepository: Repository<Webhook>,
    ) {}

    async create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook> {
        const webhook = this.ormRepository.create({
            ...dto,
            tenantId,
            method: dto.method || 'POST',
            isActive: dto.isActive !== false,
            timeout: dto.timeout || 30000,
            maxRetries: dto.maxRetries || 3,
        });

        return this.ormRepository.save(webhook);
    }

    async findAll(tenantId: string): Promise<Webhook[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['webhookEvents', 'tenant'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string, tenantId: string): Promise<Webhook | null> {
        return this.ormRepository.findOne({
            where: { id, tenantId },
            relations: ['webhookEvents', 'tenant'],
        });
    }

    async findByUrl(url: string, tenantId: string): Promise<Webhook | null> {
        return this.ormRepository.findOne({
            where: { url, tenantId },
            relations: ['webhookEvents', 'tenant'],
        });
    }

    async findActiveByTenant(tenantId: string): Promise<Webhook[]> {
        return this.ormRepository.find({
            where: { 
                tenantId, 
                isActive: true 
            },
            relations: ['webhookEvents'],
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<Webhook | null> {
        const updateData = { ...dto };

        if (Object.keys(updateData).length === 0) {
            return this.findById(id, tenantId);
        }

        const result = await this.ormRepository.update(
            { id, tenantId },
            updateData
        );

        if (result.affected === 0) {
            return null;
        }

        return this.findById(id, tenantId);
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ id, tenantId });
        return !!result?.affected && result.affected > 0;
    }
}