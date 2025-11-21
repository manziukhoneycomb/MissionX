import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AddPaymentMethodDto, PaymentMethodDto } from '../dto/payment-method.dto';
import { StripeIntegrationService } from '../services/stripe-integration.service';

export class AddPaymentMethodCommand implements ICommand {
    constructor(
        public readonly dto: AddPaymentMethodDto,
    ) {}
}

@Injectable()
@CommandHandler(AddPaymentMethodCommand)
export class AddPaymentMethodHandler implements ICommandHandler<AddPaymentMethodCommand> {
    constructor(
        private readonly stripeIntegrationService: StripeIntegrationService,
    ) {}

    async execute(command: AddPaymentMethodCommand): Promise<PaymentMethodDto> {
        const { dto } = command;
        return await this.stripeIntegrationService.addPaymentMethod(dto);
    }
}