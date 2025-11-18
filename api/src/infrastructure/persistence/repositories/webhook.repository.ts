import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../../../domain/entities/webhook.entity';
import { IWebhookRepository } from '../../../application/repositories/webhook.repository';
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
            relations: ['tenant', 'webhookEvents', 'webhookLogs'],
        });
    }

    async findByIdAndTenantId(id: string, tenantId: string): Promise<Webhook | null> {
        return this.ormRepository.findOne({
            where: { id, tenantId },
            relations: ['tenant', 'webhookEvents', 'webhookLogs'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Webhook[]> {
        return this.ormRepository.find({
            where: { tenantId },
            relations: ['tenant', 'webhookEvents'],
            order: { createdAt: 'DESC' },
        });
    }

    async findActiveByTenantId(tenantId: string): Promise<Webhook[]> {
        return this.ormRepository.find({
            where: { tenantId, isActive: true },
            relations: ['tenant', 'webhookEvents'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByEventType(eventType: string, tenantId: string): Promise<Webhook[]> {
        return this.ormRepository
            .createQueryBuilder('webhook')
            .leftJoinAndSelect('webhook.tenant', 'tenant')
            .where('webhook.tenantId = :tenantId', { tenantId })
            .andWhere('webhook.isActive = :isActive', { isActive: true })
            .andWhere(':eventType = ANY(webhook.events)', { eventType })
            .getMany();
    }

    async create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook> {
        const webhook = this.ormRepository.create({
            ...dto,
            tenantId,
            method: dto.method || 'POST',
            isActive: dto.isActive !== undefined ? dto.isActive : true,
            timeout: dto.timeout || 30000,
            maxRetries: dto.maxRetries !== undefined ? dto.maxRetries : 3,
        });

        return await this.ormRepository.save(webhook);
    }

    async update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<Webhook | null> {
        const webhook = await this.findByIdAndTenantId(id, tenantId);

        if (!webhook) {
            this.logger.warn(`Webhook with ID ${id} not found for tenant ${tenantId} during update.`);
            return null;
        }

        this.ormRepository.merge(webhook, dto);
        return await this.ormRepository.save(webhook);
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.ormRepository.delete({ id, tenantId });
        return !!result?.affected && result.affected > 0;
    }

    async activate(id: string, tenantId: string): Promise<void> {
        const webhook = await this.findByIdAndTenantId(id, tenantId);

        if (!webhook) {
            return;
        }

        webhook.isActive = true;
        await this.ormRepository.save(webhook);
    }

    async deactivate(id: string, tenantId: string): Promise<void> {
        const webhook = await this.findByIdAndTenantId(id, tenantId);

        if (!webhook) {
            return;
        }

        webhook.isActive = false;
        await this.ormRepository.save(webhook);
    }
}