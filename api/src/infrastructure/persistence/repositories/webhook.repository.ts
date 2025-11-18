import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../../../domain/entities/webhook.entity';
import { IWebhookRepository } from '../../../application/repositories/webhook.repository.interface';
import { CreateWebhookDto } from '../../../application/webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../../../application/webhooks/dto/update-webhook.dto';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
    constructor(
        @InjectRepository(Webhook)
        private readonly repository: Repository<Webhook>,
    ) {}

    async create(dto: CreateWebhookDto, tenantId: string): Promise<Webhook> {
        const webhook = this.repository.create({
            ...dto,
            tenantId,
        });
        return await this.repository.save(webhook);
    }

    async findAll(tenantId: string): Promise<Webhook[]> {
        return await this.repository.find({
            where: { tenantId },
            relations: ['tenant'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string, tenantId: string): Promise<Webhook | null> {
        return await this.repository.findOne({
            where: { id, tenantId },
            relations: ['tenant'],
        });
    }

    async findByEvents(events: string[], tenantId: string): Promise<Webhook[]> {
        return await this.repository
            .createQueryBuilder('webhook')
            .where('webhook.tenantId = :tenantId', { tenantId })
            .andWhere('webhook.events && :events', { events })
            .leftJoinAndSelect('webhook.tenant', 'tenant')
            .orderBy('webhook.createdAt', 'DESC')
            .getMany();
    }

    async findActiveByEvents(events: string[], tenantId: string): Promise<Webhook[]> {
        return await this.repository
            .createQueryBuilder('webhook')
            .where('webhook.tenantId = :tenantId', { tenantId })
            .andWhere('webhook.isActive = :isActive', { isActive: true })
            .andWhere('webhook.events && :events', { events })
            .leftJoinAndSelect('webhook.tenant', 'tenant')
            .orderBy('webhook.createdAt', 'DESC')
            .getMany();
    }

    async update(id: string, dto: UpdateWebhookDto, tenantId: string): Promise<Webhook | null> {
        const webhook = await this.findById(id, tenantId);
        if (!webhook) {
            return null;
        }

        Object.assign(webhook, dto);
        return await this.repository.save(webhook);
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        const result = await this.repository.delete({ id, tenantId });
        return result.affected > 0;
    }

    async toggleActive(id: string, isActive: boolean, tenantId: string): Promise<Webhook | null> {
        const webhook = await this.findById(id, tenantId);
        if (!webhook) {
            return null;
        }

        webhook.isActive = isActive;
        return await this.repository.save(webhook);
    }
}