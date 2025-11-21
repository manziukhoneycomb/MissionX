import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionRepository {
    private readonly logger = new Logger(SubscriptionRepository.name);

    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
    ) {}

    async create(data: Partial<Subscription>): Promise<Subscription> {
        const subscription = this.subscriptionRepository.create(data);
        return await this.subscriptionRepository.save(subscription);
    }

    async findById(id: string): Promise<Subscription | null> {
        return await this.subscriptionRepository.findOne({ 
            where: { id },
            relations: ['tenant']
        });
    }

    async findByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
        return await this.subscriptionRepository.findOne({ 
            where: { stripeSubscriptionId },
            relations: ['tenant']
        });
    }

    async findByTenantId(tenantId: string): Promise<Subscription | null> {
        return await this.subscriptionRepository.findOne({ 
            where: { tenantId },
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findActiveByTenantId(tenantId: string): Promise<Subscription | null> {
        return await this.subscriptionRepository.findOne({ 
            where: { 
                tenantId,
                status: SubscriptionStatus.ACTIVE
            },
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByCustomerId(stripeCustomerId: string): Promise<Subscription[]> {
        return await this.subscriptionRepository.find({ 
            where: { stripeCustomerId },
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findActiveByCustomerId(stripeCustomerId: string): Promise<Subscription[]> {
        return await this.subscriptionRepository.find({ 
            where: { 
                stripeCustomerId,
                status: SubscriptionStatus.ACTIVE
            },
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findByStatus(status: SubscriptionStatus): Promise<Subscription[]> {
        return await this.subscriptionRepository.find({ 
            where: { status },
            relations: ['tenant'],
            order: { createdAt: 'DESC' }
        });
    }

    async findExpiring(daysFromNow: number = 7): Promise<Subscription[]> {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysFromNow);

        return await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.tenant', 'tenant')
            .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
            .andWhere('subscription.currentPeriodEnd <= :expirationDate', { expirationDate })
            .orderBy('subscription.currentPeriodEnd', 'ASC')
            .getMany();
    }

    async findInTrial(): Promise<Subscription[]> {
        return await this.subscriptionRepository.find({ 
            where: { 
                status: SubscriptionStatus.TRIALING,
                trialEnd: Not(IsNull())
            },
            relations: ['tenant'],
            order: { trialEnd: 'ASC' }
        });
    }

    async findTrialsExpiring(daysFromNow: number = 3): Promise<Subscription[]> {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysFromNow);

        return await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.tenant', 'tenant')
            .where('subscription.status = :status', { status: SubscriptionStatus.TRIALING })
            .andWhere('subscription.trialEnd IS NOT NULL')
            .andWhere('subscription.trialEnd <= :expirationDate', { expirationDate })
            .orderBy('subscription.trialEnd', 'ASC')
            .getMany();
    }

    async update(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
        const subscription = await this.subscriptionRepository.findOne({ where: { id } });
        
        if (!subscription) {
            this.logger.warn(`Subscription with ID ${id} not found for update`);
            return null;
        }

        this.subscriptionRepository.merge(subscription, data);
        return await this.subscriptionRepository.save(subscription);
    }

    async updateByStripeId(stripeSubscriptionId: string, data: Partial<Subscription>): Promise<Subscription | null> {
        const subscription = await this.subscriptionRepository.findOne({ where: { stripeSubscriptionId } });
        
        if (!subscription) {
            this.logger.warn(`Subscription with Stripe ID ${stripeSubscriptionId} not found for update`);
            return null;
        }

        this.subscriptionRepository.merge(subscription, data);
        return await this.subscriptionRepository.save(subscription);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.subscriptionRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async deleteByStripeId(stripeSubscriptionId: string): Promise<boolean> {
        const result = await this.subscriptionRepository.delete({ stripeSubscriptionId });
        return !!result?.affected && result.affected > 0;
    }

    async cancel(id: string, canceledAt?: Date): Promise<Subscription | null> {
        return await this.update(id, {
            status: SubscriptionStatus.CANCELED,
            canceledAt: canceledAt || new Date()
        });
    }

    async cancelByStripeId(stripeSubscriptionId: string, canceledAt?: Date): Promise<Subscription | null> {
        return await this.updateByStripeId(stripeSubscriptionId, {
            status: SubscriptionStatus.CANCELED,
            canceledAt: canceledAt || new Date()
        });
    }

    async activate(id: string): Promise<Subscription | null> {
        return await this.update(id, {
            status: SubscriptionStatus.ACTIVE
        });
    }

    async activateByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
        return await this.updateByStripeId(stripeSubscriptionId, {
            status: SubscriptionStatus.ACTIVE
        });
    }

    async markPastDue(id: string): Promise<Subscription | null> {
        return await this.update(id, {
            status: SubscriptionStatus.PAST_DUE
        });
    }

    async markPastDueByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
        return await this.updateByStripeId(stripeSubscriptionId, {
            status: SubscriptionStatus.PAST_DUE
        });
    }

    async markUnpaid(id: string): Promise<Subscription | null> {
        return await this.update(id, {
            status: SubscriptionStatus.UNPAID
        });
    }

    async markUnpaidByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
        return await this.updateByStripeId(stripeSubscriptionId, {
            status: SubscriptionStatus.UNPAID
        });
    }

    async count(): Promise<number> {
        return await this.subscriptionRepository.count();
    }

    async countByStatus(status: SubscriptionStatus): Promise<number> {
        return await this.subscriptionRepository.count({ where: { status } });
    }

    async countByTenant(tenantId: string): Promise<number> {
        return await this.subscriptionRepository.count({ where: { tenantId } });
    }
}