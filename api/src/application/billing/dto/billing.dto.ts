import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class PaymentMethodDto {
    @ApiProperty({ description: 'Payment method ID' })
    id: string;

    @ApiProperty({ description: 'Payment method type', enum: ['card', 'bank_account'] })
    type: 'card' | 'bank_account';

    @ApiProperty({ description: 'Last 4 digits' })
    last4: string;

    @ApiProperty({ description: 'Card brand', required: false })
    brand?: string;

    @ApiProperty({ description: 'Expiry month', required: false })
    expiryMonth?: number;

    @ApiProperty({ description: 'Expiry year', required: false })
    expiryYear?: number;

    @ApiProperty({ description: 'Whether this is the default payment method' })
    isDefault: boolean;

    @ApiProperty({ description: 'Card holder name', required: false })
    holderName?: string;
}

export class SubscriptionDto {
    @ApiProperty({ description: 'Subscription ID' })
    id: string;

    @ApiProperty({ 
        description: 'Subscription status',
        enum: ['active', 'inactive', 'past_due', 'canceled', 'unpaid']
    })
    status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid';

    @ApiProperty({ description: 'Plan name' })
    planName: string;

    @ApiProperty({ description: 'Plan price in cents' })
    planPrice: number;

    @ApiProperty({ description: 'Billing interval', enum: ['month', 'year'] })
    planInterval: 'month' | 'year';

    @ApiProperty({ description: 'Current period start date' })
    currentPeriodStart: string;

    @ApiProperty({ description: 'Current period end date' })
    currentPeriodEnd: string;

    @ApiProperty({ description: 'Whether subscription will cancel at period end' })
    cancelAtPeriodEnd: boolean;

    @ApiProperty({ description: 'Trial end date', required: false })
    trialEnd?: string;
}

export class UpcomingInvoiceDto {
    @ApiProperty({ description: 'Invoice ID' })
    id: string;

    @ApiProperty({ description: 'Invoice amount in cents' })
    amount: number;

    @ApiProperty({ description: 'Due date' })
    dueDate: string;

    @ApiProperty({ 
        description: 'Invoice status',
        enum: ['draft', 'open', 'paid', 'void']
    })
    status: 'draft' | 'open' | 'paid' | 'void';
}

export class BillingHistoryItemDto {
    @ApiProperty({ description: 'Invoice ID' })
    id: string;

    @ApiProperty({ description: 'Invoice amount in cents' })
    amount: number;

    @ApiProperty({ 
        description: 'Invoice status',
        enum: ['paid', 'pending', 'failed']
    })
    status: 'paid' | 'pending' | 'failed';

    @ApiProperty({ description: 'Invoice date' })
    date: string;

    @ApiProperty({ description: 'Invoice description' })
    description: string;

    @ApiProperty({ description: 'Download URL', required: false })
    downloadUrl?: string;
}

export class BillingInfoDto {
    @ApiProperty({ description: 'Current subscription', type: SubscriptionDto })
    subscription: SubscriptionDto;

    @ApiProperty({ description: 'Payment methods', type: [PaymentMethodDto] })
    paymentMethods: PaymentMethodDto[];

    @ApiProperty({ description: 'Upcoming invoice', type: UpcomingInvoiceDto, required: false })
    upcomingInvoice?: UpcomingInvoiceDto;

    @ApiProperty({ description: 'Billing history', type: [BillingHistoryItemDto] })
    billingHistory: BillingHistoryItemDto[];
}

export class AddPaymentMethodDto {
    @ApiProperty({ 
        description: 'Payment method type',
        enum: ['card', 'bank_account']
    })
    @IsEnum(['card', 'bank_account'])
    type: 'card' | 'bank_account';

    @ApiProperty({ description: 'Payment method token from payment provider' })
    @IsString()
    token: string;

    @ApiProperty({ 
        description: 'Whether to set as default payment method',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    setAsDefault?: boolean;
}

export class UpdateSubscriptionDto {
    @ApiProperty({ description: 'New plan ID' })
    @IsString()
    planId: string;
}