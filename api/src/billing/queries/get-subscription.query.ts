import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionDto } from '../dto/subscription.dto';
import { SubscriptionRepository } from '../repositories/subscription.repository';

export class GetSubscriptionQuery implements IQuery {
    constructor(
        public readonly tenantId: string,
    ) {}
}

export class GetSubscriptionByIdQuery implements IQuery {
    constructor(
        public readonly subscriptionId: string,
    ) {}
}

@Injectable()
@QueryHandler(GetSubscriptionQuery)
export class GetSubscriptionHandler implements IQueryHandler<GetSubscriptionQuery> {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
    ) {}

    async execute(query: GetSubscriptionQuery): Promise<SubscriptionDto | null> {
        const { tenantId } = query;
        const subscription = await this.subscriptionRepository.findByTenantId(tenantId);
        
        if (!subscription) {
            return null;
        }

        return this.mapSubscriptionToDto(subscription);
    }

    private mapSubscriptionToDto(subscription: any): SubscriptionDto {
        const dto = new SubscriptionDto();
        dto.id = subscription.id;
        dto.stripeSubscriptionId = subscription.stripeSubscriptionId;
        dto.tenantId = subscription.tenantId;
        dto.stripeCustomerId = subscription.stripeCustomerId;
        dto.stripePriceId = subscription.stripePriceId;
        dto.status = subscription.status;
        dto.currentPeriodStart = subscription.currentPeriodStart;
        dto.currentPeriodEnd = subscription.currentPeriodEnd;
        dto.trialEnd = subscription.trialEnd;
        dto.canceledAt = subscription.canceledAt;
        dto.createdAt = subscription.createdAt;
        dto.updatedAt = subscription.updatedAt;
        return dto;
    }
}

@Injectable()
@QueryHandler(GetSubscriptionByIdQuery)
export class GetSubscriptionByIdHandler implements IQueryHandler<GetSubscriptionByIdQuery> {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
    ) {}

    async execute(query: GetSubscriptionByIdQuery): Promise<SubscriptionDto> {
        const { subscriptionId } = query;
        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        return this.mapSubscriptionToDto(subscription);
    }

    private mapSubscriptionToDto(subscription: any): SubscriptionDto {
        const dto = new SubscriptionDto();
        dto.id = subscription.id;
        dto.stripeSubscriptionId = subscription.stripeSubscriptionId;
        dto.tenantId = subscription.tenantId;
        dto.stripeCustomerId = subscription.stripeCustomerId;
        dto.stripePriceId = subscription.stripePriceId;
        dto.status = subscription.status;
        dto.currentPeriodStart = subscription.currentPeriodStart;
        dto.currentPeriodEnd = subscription.currentPeriodEnd;
        dto.trialEnd = subscription.trialEnd;
        dto.canceledAt = subscription.canceledAt;
        dto.createdAt = subscription.createdAt;
        dto.updatedAt = subscription.updatedAt;
        return dto;
    }
}