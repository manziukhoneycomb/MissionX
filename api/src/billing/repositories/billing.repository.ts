import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingDetails } from '../entities/billing-details.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Invoice, InvoiceLineItem } from '../entities/invoice.entity';

@Injectable()
export class BillingRepository {
    private readonly logger = new Logger(BillingRepository.name);

    constructor(
        @InjectRepository(BillingDetails)
        private readonly billingDetailsRepository: Repository<BillingDetails>,
        @InjectRepository(PaymentMethod)
        private readonly paymentMethodRepository: Repository<PaymentMethod>,
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(InvoiceLineItem)
        private readonly invoiceLineItemRepository: Repository<InvoiceLineItem>,
    ) {}

    // Billing Details methods
    async createBillingDetails(data: Partial<BillingDetails>): Promise<BillingDetails> {
        const billingDetails = this.billingDetailsRepository.create(data);
        return await this.billingDetailsRepository.save(billingDetails);
    }

    async findBillingDetailsByTenantId(tenantId: string): Promise<BillingDetails | null> {
        return await this.billingDetailsRepository.findOne({ 
            where: { tenantId },
            relations: ['tenant']
        });
    }

    async findBillingDetailsByStripeCustomerId(stripeCustomerId: string): Promise<BillingDetails | null> {
        return await this.billingDetailsRepository.findOne({ 
            where: { stripeCustomerId },
            relations: ['tenant']
        });
    }

    async updateBillingDetails(id: string, data: Partial<BillingDetails>): Promise<BillingDetails | null> {
        const billingDetails = await this.billingDetailsRepository.findOne({ where: { id } });
        
        if (!billingDetails) {
            this.logger.warn(`Billing details with ID ${id} not found for update`);
            return null;
        }

        this.billingDetailsRepository.merge(billingDetails, data);
        return await this.billingDetailsRepository.save(billingDetails);
    }

    async deleteBillingDetails(id: string): Promise<boolean> {
        const result = await this.billingDetailsRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    // Payment Method methods
    async createPaymentMethod(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
        const paymentMethod = this.paymentMethodRepository.create(data);
        return await this.paymentMethodRepository.save(paymentMethod);
    }

    async findPaymentMethodById(id: string): Promise<PaymentMethod | null> {
        return await this.paymentMethodRepository.findOne({ 
            where: { id },
            relations: ['tenant']
        });
    }

    async findPaymentMethodByStripeId(stripePaymentMethodId: string): Promise<PaymentMethod | null> {
        return await this.paymentMethodRepository.findOne({ 
            where: { stripePaymentMethodId },
            relations: ['tenant']
        });
    }

    async findPaymentMethodsByTenantId(tenantId: string): Promise<PaymentMethod[]> {
        return await this.paymentMethodRepository.find({ 
            where: { tenantId },
            relations: ['tenant'],
            order: { isDefault: 'DESC', createdAt: 'DESC' }
        });
    }

    async findPaymentMethodsByCustomerId(stripeCustomerId: string): Promise<PaymentMethod[]> {
        return await this.paymentMethodRepository.find({ 
            where: { stripeCustomerId },
            relations: ['tenant'],
            order: { isDefault: 'DESC', createdAt: 'DESC' }
        });
    }

    async findDefaultPaymentMethod(tenantId: string): Promise<PaymentMethod | null> {
        return await this.paymentMethodRepository.findOne({ 
            where: { tenantId, isDefault: true },
            relations: ['tenant']
        });
    }

    async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
        const paymentMethod = await this.paymentMethodRepository.findOne({ where: { id } });
        
        if (!paymentMethod) {
            this.logger.warn(`Payment method with ID ${id} not found for update`);
            return null;
        }

        this.paymentMethodRepository.merge(paymentMethod, data);
        return await this.paymentMethodRepository.save(paymentMethod);
    }

    async setDefaultPaymentMethod(tenantId: string, paymentMethodId: string): Promise<void> {
        // First, unset all existing default payment methods for the tenant
        await this.paymentMethodRepository.update(
            { tenantId, isDefault: true },
            { isDefault: false }
        );

        // Then, set the specified payment method as default
        await this.paymentMethodRepository.update(
            { id: paymentMethodId, tenantId },
            { isDefault: true }
        );
    }

    async deletePaymentMethod(id: string): Promise<boolean> {
        const result = await this.paymentMethodRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    // Invoice methods
    async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
        const invoice = this.invoiceRepository.create(data);
        return await this.invoiceRepository.save(invoice);
    }

    async findInvoiceById(id: string): Promise<Invoice | null> {
        return await this.invoiceRepository.findOne({ 
            where: { id },
            relations: ['tenant', 'lineItems'],
            order: { lineItems: { id: 'ASC' } }
        });
    }

    async findInvoiceByStripeId(stripeInvoiceId: string): Promise<Invoice | null> {
        return await this.invoiceRepository.findOne({ 
            where: { stripeInvoiceId },
            relations: ['tenant', 'lineItems'],
            order: { lineItems: { id: 'ASC' } }
        });
    }

    async findInvoicesByTenantId(tenantId: string, limit: number = 10, offset: number = 0): Promise<Invoice[]> {
        return await this.invoiceRepository.find({ 
            where: { tenantId },
            relations: ['tenant', 'lineItems'],
            order: { createdAt: 'DESC', lineItems: { id: 'ASC' } },
            take: limit,
            skip: offset
        });
    }

    async findInvoicesByCustomerId(stripeCustomerId: string, limit: number = 10, offset: number = 0): Promise<Invoice[]> {
        return await this.invoiceRepository.find({ 
            where: { stripeCustomerId },
            relations: ['tenant', 'lineItems'],
            order: { createdAt: 'DESC', lineItems: { id: 'ASC' } },
            take: limit,
            skip: offset
        });
    }

    async findInvoicesBySubscriptionId(stripeSubscriptionId: string, limit: number = 10, offset: number = 0): Promise<Invoice[]> {
        return await this.invoiceRepository.find({ 
            where: { stripeSubscriptionId },
            relations: ['tenant', 'lineItems'],
            order: { createdAt: 'DESC', lineItems: { id: 'ASC' } },
            take: limit,
            skip: offset
        });
    }

    async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        
        if (!invoice) {
            this.logger.warn(`Invoice with ID ${id} not found for update`);
            return null;
        }

        this.invoiceRepository.merge(invoice, data);
        return await this.invoiceRepository.save(invoice);
    }

    async deleteInvoice(id: string): Promise<boolean> {
        const result = await this.invoiceRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    // Invoice Line Item methods
    async createInvoiceLineItem(data: Partial<InvoiceLineItem>): Promise<InvoiceLineItem> {
        const lineItem = this.invoiceLineItemRepository.create(data);
        return await this.invoiceLineItemRepository.save(lineItem);
    }

    async createMultipleInvoiceLineItems(lineItems: Partial<InvoiceLineItem>[]): Promise<InvoiceLineItem[]> {
        const created = this.invoiceLineItemRepository.create(lineItems);
        return await this.invoiceLineItemRepository.save(created);
    }

    async findInvoiceLineItemsByInvoiceId(invoiceId: string): Promise<InvoiceLineItem[]> {
        return await this.invoiceLineItemRepository.find({ 
            where: { invoiceId },
            order: { id: 'ASC' }
        });
    }

    async deleteInvoiceLineItemsByInvoiceId(invoiceId: string): Promise<boolean> {
        const result = await this.invoiceLineItemRepository.delete({ invoiceId });
        return !!result?.affected && result.affected > 0;
    }
}