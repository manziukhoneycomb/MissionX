import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PaymentMethodDto, PaymentMethodType } from '../dto/payment-method.dto';
import { BillingRepository } from '../repositories/billing.repository';

export class GetPaymentMethodsQuery implements IQuery {
    constructor(
        public readonly tenantId: string,
    ) {}
}

@Injectable()
@QueryHandler(GetPaymentMethodsQuery)
export class GetPaymentMethodsHandler implements IQueryHandler<GetPaymentMethodsQuery> {
    constructor(
        private readonly billingRepository: BillingRepository,
    ) {}

    async execute(query: GetPaymentMethodsQuery): Promise<PaymentMethodDto[]> {
        const { tenantId } = query;
        const paymentMethods = await this.billingRepository.findPaymentMethodsByTenantId(tenantId);
        
        return paymentMethods.map(pm => this.mapPaymentMethodToDto(pm));
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

        if (paymentMethod.type === PaymentMethodType.CARD && paymentMethod.cardBrand) {
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