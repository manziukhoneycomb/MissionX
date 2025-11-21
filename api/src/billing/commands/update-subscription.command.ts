import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateSubscriptionDto, SubscriptionDto } from '../dto/subscription.dto';
import { StripeIntegrationService } from '../services/stripe-integration.service';

export class UpdateSubscriptionCommand implements ICommand {
    constructor(
        public readonly subscriptionId: string,
        public readonly dto: UpdateSubscriptionDto,
    ) {}
}

@Injectable()
@CommandHandler(UpdateSubscriptionCommand)
export class UpdateSubscriptionHandler implements ICommandHandler<UpdateSubscriptionCommand> {
    constructor(
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async execute(command: UpdateSubscriptionCommand): Promise<SubscriptionDto> {
        const { subscriptionId, dto } = command;
        
        if (!dto.stripePriceId) {
            throw new Error('Price ID is required for subscription update');
        }

        return await this.stripeIntegrationService.updateSubscription(
            subscriptionId,
            dto.stripePriceId,
            dto.prorationBehavior
        );
    }
}