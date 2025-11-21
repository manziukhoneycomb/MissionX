import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum InvoiceStatus {
    DRAFT = 'draft',
    OPEN = 'open',
    PAID = 'paid',
    UNCOLLECTIBLE = 'uncollectible',
    VOID = 'void',
}

export class InvoiceLineItemDto {
    @ApiProperty({
        description: 'Line item ID',
        example: 'il_1234567890',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Description of the line item',
        example: 'Pro Plan - Jan 2024',
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Amount in cents',
        example: 2999,
    })
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'Currency code',
        example: 'usd',
    })
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'Quantity',
        example: 1,
    })
    @IsNumber()
    quantity: number;

    @ApiProperty({
        description: 'Unit amount in cents',
        example: 2999,
    })
    @IsNumber()
    unitAmount: number;

    @ApiProperty({
        description: 'Billing period start',
        example: '2024-01-01T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    periodStart?: Date;

    @ApiProperty({
        description: 'Billing period end',
        example: '2024-02-01T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    periodEnd?: Date;
}

export class InvoiceDto {
    @ApiProperty({
        description: 'Invoice ID',
        example: 'inv_1234567890',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Stripe invoice ID',
        example: 'in_1234567890',
    })
    @IsString()
    stripeInvoiceId: string;

    @ApiProperty({
        description: 'Tenant ID associated with the invoice',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    tenantId: string;

    @ApiProperty({
        description: 'Stripe customer ID',
        example: 'cus_1234567890',
    })
    @IsString()
    stripeCustomerId: string;

    @ApiProperty({
        description: 'Stripe subscription ID',
        example: 'sub_1234567890',
        required: false,
    })
    @IsOptional()
    @IsString()
    stripeSubscriptionId?: string;

    @ApiProperty({
        description: 'Invoice number',
        example: 'ABC-001',
    })
    @IsString()
    number: string;

    @ApiProperty({
        description: 'Invoice status',
        enum: InvoiceStatus,
        example: InvoiceStatus.PAID,
    })
    @IsEnum(InvoiceStatus)
    status: InvoiceStatus;

    @ApiProperty({
        description: 'Total amount in cents',
        example: 2999,
    })
    @IsNumber()
    amountDue: number;

    @ApiProperty({
        description: 'Amount paid in cents',
        example: 2999,
    })
    @IsNumber()
    amountPaid: number;

    @ApiProperty({
        description: 'Subtotal in cents',
        example: 2999,
    })
    @IsNumber()
    subtotal: number;

    @ApiProperty({
        description: 'Tax amount in cents',
        example: 240,
    })
    @IsNumber()
    tax: number;

    @ApiProperty({
        description: 'Total amount in cents',
        example: 3239,
    })
    @IsNumber()
    total: number;

    @ApiProperty({
        description: 'Currency code',
        example: 'usd',
    })
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'Invoice line items',
        type: [InvoiceLineItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceLineItemDto)
    lineItems: InvoiceLineItemDto[];

    @ApiProperty({
        description: 'Invoice PDF URL',
        example: 'https://invoice.stripe.com/i/acct_1234567890/live_YWNjdF8xTlRIVnlDWlFiMFRrNA',
        required: false,
    })
    @IsOptional()
    @IsUrl()
    invoicePdf?: string;

    @ApiProperty({
        description: 'Hosted invoice URL',
        example: 'https://invoice.stripe.com/i/acct_1234567890/live_YWNjdF8xTlRIVnlDWlFiMFRrNA',
        required: false,
    })
    @IsOptional()
    @IsUrl()
    hostedInvoiceUrl?: string;

    @ApiProperty({
        description: 'Date when invoice was created',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    createdAt: Date;

    @ApiProperty({
        description: 'Date when invoice was finalized',
        example: '2024-01-01T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    finalizedAt?: Date;

    @ApiProperty({
        description: 'Date when invoice was paid',
        example: '2024-01-01T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    paidAt?: Date;

    @ApiProperty({
        description: 'Due date for the invoice',
        example: '2024-01-15T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dueDate?: Date;
}

export class CreateInvoiceDto {
    @ApiProperty({
        description: 'Tenant ID for the invoice',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    tenantId: string;

    @ApiProperty({
        description: 'Description for the invoice',
        example: 'Custom invoice for additional services',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Days until due',
        example: 30,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    daysUntilDue?: number;

    @ApiProperty({
        description: 'Auto advance the invoice',
        example: true,
        required: false,
    })
    @IsOptional()
    autoAdvance?: boolean;
}