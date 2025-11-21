import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { StripeIntegrationService } from '../services/stripe-integration.service';

export class RemovePaymentMethodCommand implements ICommand {
    constructor(
        public readonly paymentMethodId: string,
    ) {}
}

@Injectable()
@CommandHandler(RemovePaymentMethodCommand)
export class RemovePaymentMethodHandler implements ICommandHandler<RemovePaymentMethodCommand> {
    constructor(
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async execute(command: RemovePaymentMethodCommand): Promise<void> {
        const { paymentMethodId } = command;
        await this.stripeIntegrationService.removePaymentMethod(paymentMethodId);
    }
}