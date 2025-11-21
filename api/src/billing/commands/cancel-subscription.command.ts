import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { SubscriptionDto } from '../dto/subscription.dto';
import { StripeIntegrationService } from '../services/stripe-integration.service';

export class CancelSubscriptionCommand implements ICommand {
    constructor(
        public readonly subscriptionId: string,
        public readonly cancelAtPeriodEnd: boolean = true,
    ) {}
}

@Injectable()
@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler implements ICommandHandler<CancelSubscriptionCommand> {
    constructor(
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async execute(command: CancelSubscriptionCommand): Promise<SubscriptionDto> {
        const { subscriptionId, cancelAtPeriodEnd } = command;
        return await this.stripeIntegrationService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
    }
}