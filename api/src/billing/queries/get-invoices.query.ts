import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { InvoiceDto, InvoiceLineItemDto } from '../dto/invoice.dto';
import { BillingRepository } from '../repositories/billing.repository';

export class GetInvoicesQuery implements IQuery {
    constructor(
        public readonly tenantId: string,
        public readonly limit: number = 10,
        public readonly offset: number = 0,
    ) {}
}

@Injectable()
@QueryHandler(GetInvoicesQuery)
export class GetInvoicesHandler implements IQueryHandler<GetInvoicesQuery> {
    constructor(
        private readonly billingRepository: BillingRepository,
    ) {}

    async execute(query: GetInvoicesQuery): Promise<InvoiceDto[]> {
        const { tenantId, limit, offset } = query;
        const invoices = await this.billingRepository.findInvoicesByTenantId(tenantId, limit, offset);
        
        return invoices.map(invoice => this.mapInvoiceToDto(invoice));
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
}