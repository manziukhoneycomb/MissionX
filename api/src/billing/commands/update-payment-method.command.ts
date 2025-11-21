import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Injectable, BadRequestException } from '@nestjs/common';
import { UpdatePaymentMethodDto, PaymentMethodDto } from '../dto/payment-method.dto';
import { BillingRepository } from '../repositories/billing.repository';

export class UpdatePaymentMethodCommand implements ICommand {
    constructor(
        public readonly paymentMethodId: string,
        public readonly dto: UpdatePaymentMethodDto,
    ) {}
}

@Injectable()
@CommandHandler(UpdatePaymentMethodCommand)
export class UpdatePaymentMethodHandler implements ICommandHandler<UpdatePaymentMethodCommand> {
    constructor(
        private readonly billingRepository: BillingRepository,
    ) {}

    async execute(command: UpdatePaymentMethodCommand): Promise<PaymentMethodDto> {
        const { paymentMethodId, dto } = command;

        // Find the payment method
        const paymentMethod = await this.billingRepository.findPaymentMethodById(paymentMethodId);
        if (!paymentMethod) {
            throw new BadRequestException('Payment method not found');
        }

        // If setting as default, update all other payment methods for this tenant
        if (dto.setAsDefault) {
            await this.billingRepository.setDefaultPaymentMethod(paymentMethod.tenantId, paymentMethodId);
        }

        // Get the updated payment method
        const updatedPaymentMethod = await this.billingRepository.findPaymentMethodById(paymentMethodId);
        if (!updatedPaymentMethod) {
            throw new BadRequestException('Failed to update payment method');
        }

        return this.mapPaymentMethodToDto(updatedPaymentMethod);
    }

    private mapPaymentMethodToDto(paymentMethod: any): PaymentMethodDto {
        const dto = new PaymentMethodDto();
        dto.id = paymentMethod.id;
        dto.stripePaymentMethodId = paymentMethod.stripePaymentMethodId;
        dto.tenantId = paymentMethod.tenantId;
        dto.stripeCustomerId = paymentMethod.stripeCustomerId;
        dto.type = paymentMethod.type;
        dto.isDefault = paymentMethod.isDefault;
        dto.createdAt = paymentMethod.createdAt;

        if (paymentMethod.cardBrand) {
            dto.card = {
                brand: paymentMethod.cardBrand,
                last4: paymentMethod.cardLast4,
                expMonth: paymentMethod.cardExpMonth,
                expYear: paymentMethod.cardExpYear,
                country: paymentMethod.cardCountry,
            };
        }

        return dto;
    }
}