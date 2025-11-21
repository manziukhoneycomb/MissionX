import { Injectable, NotFoundException } from '@nestjs/common';
import { IBillingService } from './interfaces/billing.service.interface';
import {
    BillingInfoDto,
    AddPaymentMethodDto,
    PaymentMethodDto,
    UpdateSubscriptionDto,
    SubscriptionDto,
    UpcomingInvoiceDto,
    BillingHistoryItemDto,
} from './dto/billing.dto';

@Injectable()
export class BillingService implements IBillingService {
    async getBillingInfo(tenantId: string): Promise<BillingInfoDto> {
        // In a real implementation, this would integrate with a payment provider like Stripe
        // For now, we'll return mock data to demonstrate the UI
        
        const mockSubscription: SubscriptionDto = {
            id: 'sub_1234567890',
            status: 'active',
            planName: 'Professional Plan',
            planPrice: 4999, // $49.99 in cents
            planInterval: 'month',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
        };

        const mockPaymentMethods: PaymentMethodDto[] = [
            {
                id: 'pm_1234567890',
                type: 'card',
                last4: '4242',
                brand: 'Visa',
                expiryMonth: 12,
                expiryYear: 2025,
                isDefault: true,
                holderName: 'John Doe',
            },
        ];

        const mockUpcomingInvoice: UpcomingInvoiceDto = {
            id: 'in_1234567890',
            amount: 4999,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'draft',
        };

        const mockBillingHistory: BillingHistoryItemDto[] = [
            {
                id: 'in_0987654321',
                amount: 4999,
                status: 'paid',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Professional Plan - Monthly',
                downloadUrl: '/api/invoices/in_0987654321/download',
            },
            {
                id: 'in_1122334455',
                amount: 4999,
                status: 'paid',
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Professional Plan - Monthly',
                downloadUrl: '/api/invoices/in_1122334455/download',
            },
        ];

        return {
            subscription: mockSubscription,
            paymentMethods: mockPaymentMethods,
            upcomingInvoice: mockUpcomingInvoice,
            billingHistory: mockBillingHistory,
        };
    }

    async addPaymentMethod(
        tenantId: string,
        paymentMethodData: AddPaymentMethodDto,
    ): Promise<PaymentMethodDto> {
        // In a real implementation, this would:
        // 1. Validate the payment method token with the payment provider
        // 2. Attach the payment method to the customer
        // 3. Store the payment method reference in the database
        
        const newPaymentMethod: PaymentMethodDto = {
            id: `pm_${Date.now()}`,
            type: paymentMethodData.type,
            last4: '1234', // This would come from the payment provider
            brand: paymentMethodData.type === 'card' ? 'Visa' : undefined,
            expiryMonth: paymentMethodData.type === 'card' ? 12 : undefined,
            expiryYear: paymentMethodData.type === 'card' ? 2026 : undefined,
            isDefault: paymentMethodData.setAsDefault ?? false,
            holderName: 'Card Holder',
        };

        return newPaymentMethod;
    }

    async removePaymentMethod(tenantId: string, paymentMethodId: string): Promise<void> {
        // In a real implementation, this would:
        // 1. Verify the payment method belongs to the tenant
        // 2. Remove the payment method from the payment provider
        // 3. Update the database
        
        // For now, we'll just simulate the operation
        if (!paymentMethodId) {
            throw new NotFoundException('Payment method not found');
        }
    }

    async setDefaultPaymentMethod(
        tenantId: string,
        paymentMethodId: string,
    ): Promise<PaymentMethodDto> {
        // In a real implementation, this would:
        // 1. Verify the payment method belongs to the tenant
        // 2. Update the default payment method with the payment provider
        // 3. Update the database
        
        const updatedPaymentMethod: PaymentMethodDto = {
            id: paymentMethodId,
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true,
            holderName: 'John Doe',
        };

        return updatedPaymentMethod;
    }

    async updateSubscription(
        tenantId: string,
        subscriptionData: UpdateSubscriptionDto,
    ): Promise<SubscriptionDto> {
        // In a real implementation, this would:
        // 1. Validate the plan ID
        // 2. Update the subscription with the payment provider
        // 3. Handle prorations and billing changes
        // 4. Update the database
        
        const updatedSubscription: SubscriptionDto = {
            id: 'sub_1234567890',
            status: 'active',
            planName: 'Enterprise Plan', // Updated plan name
            planPrice: 9999, // Updated price
            planInterval: 'month',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
        };

        return updatedSubscription;
    }
}