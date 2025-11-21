import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto, SubscriptionDto } from '../dto/subscription.dto';
import { StripeIntegrationService } from '../services/stripe-integration.service';

export class CreateSubscriptionCommand implements ICommand {
    constructor(
        public readonly dto: CreateSubscriptionDto,
    ) {}
}

@Injectable()
@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler implements ICommandHandler<CreateSubscriptionCommand> {
    constructor(
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async execute(command: CreateSubscriptionCommand): Promise<SubscriptionDto> {
        const { dto } = command;
        return await this.stripeIntegrationService.createSubscription(dto);
    }
}