import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { BillingOverviewDto, UsageMetricsDto } from '../dto/billing-details.dto';
import { SubscriptionDto } from '../dto/subscription.dto';
import { PaymentMethodDto, PaymentMethodType } from '../dto/payment-method.dto';
import { InvoiceDto, InvoiceLineItemDto } from '../dto/invoice.dto';
import { BillingRepository } from '../repositories/billing.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';

export class GetBillingOverviewQuery implements IQuery {
    constructor(
        public readonly tenantId: string,
    ) {}
}

@Injectable()
@QueryHandler(GetBillingOverviewQuery)
export class GetBillingOverviewHandler implements IQueryHandler<GetBillingOverviewQuery> {
    constructor(
        private readonly billingRepository: BillingRepository,
        private readonly subscriptionRepository: SubscriptionRepository,
    ) {}

    async execute(query: GetBillingOverviewQuery): Promise<BillingOverviewDto> {
        const { tenantId } = query;

        // Get subscription
        const subscription = await this.subscriptionRepository.findByTenantId(tenantId);

        // Get payment methods
        const paymentMethods = await this.billingRepository.findPaymentMethodsByTenantId(tenantId);

        // Get recent invoices (last 5)
        const invoices = await this.billingRepository.findInvoicesByTenantId(tenantId, 5, 0);

        // Create billing overview DTO
        const billingOverview = new BillingOverviewDto();
        
        // Map subscription
        if (subscription) {
            billingOverview.subscription = this.mapSubscriptionToDto(subscription);
            billingOverview.nextBillingDate = subscription.currentPeriodEnd;
            billingOverview.nextBillingAmount = 2999; // This would be calculated based on the subscription
        } else {
            billingOverview.nextBillingAmount = 0;
        }

        // Map payment methods
        billingOverview.paymentMethods = paymentMethods.map(pm => this.mapPaymentMethodToDto(pm));

        // Map recent invoices
        billingOverview.recentInvoices = invoices.map(invoice => this.mapInvoiceToDto(invoice));

        // Create mock usage metrics (in a real implementation, this would come from actual usage tracking)
        billingOverview.usageMetrics = this.createMockUsageMetrics();

        return billingOverview;
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

    private mapInvoiceToDto(invoice: any): InvoiceDto {
        const dto = new InvoiceDto();
        dto.id = invoice.id;
        dto.stripeInvoiceId = invoice.stripeInvoiceId;
        dto.tenantId = invoice.tenantId;
        dto.stripeCustomerId = invoice.stripeCustomerId;
        dto.stripeSubscriptionId = invoice.stripeSubscriptionId;
        dto.number = invoice.number;
        dto.status = invoice.status;
        dto.amountDue = invoice.amountDue;
        dto.amountPaid = invoice.amountPaid;
        dto.subtotal = invoice.subtotal;
        dto.tax = invoice.tax;
        dto.total = invoice.total;
        dto.currency = invoice.currency;
        dto.invoicePdf = invoice.invoicePdf;
        dto.hostedInvoiceUrl = invoice.hostedInvoiceUrl;
        dto.createdAt = invoice.createdAt;
        dto.finalizedAt = invoice.finalizedAt;
        dto.paidAt = invoice.paidAt;
        dto.dueDate = invoice.dueDate;

        if (invoice.lineItems && invoice.lineItems.length > 0) {
            dto.lineItems = invoice.lineItems.map((lineItem: any) => this.mapLineItemToDto(lineItem));
        } else {
            dto.lineItems = [];
        }

        return dto;
    }

    private mapLineItemToDto(lineItem: any): InvoiceLineItemDto {
        const dto = new InvoiceLineItemDto();
        dto.id = lineItem.id;
        dto.description = lineItem.description;
        dto.amount = lineItem.amount;
        dto.currency = lineItem.currency;
        dto.quantity = lineItem.quantity;
        dto.unitAmount = lineItem.unitAmount;
        dto.periodStart = lineItem.periodStart;
        dto.periodEnd = lineItem.periodEnd;
        return dto;
    }

    private createMockUsageMetrics(): UsageMetricsDto {
        const dto = new UsageMetricsDto();
        dto.activeUsers = 25;
        dto.storageUsed = 5.2;
        dto.apiCalls = 15000;
        dto.lastUpdated = new Date();
        return dto;
    }
}