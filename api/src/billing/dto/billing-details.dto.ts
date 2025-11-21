import { IsString, IsNumber, IsOptional, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionDto } from './subscription.dto';
import { PaymentMethodDto } from './payment-method.dto';
import { InvoiceDto } from './invoice.dto';

export class UsageMetricsDto {
    @ApiProperty({
        description: 'Number of active users in the tenant',
        example: 25,
    })
    @IsNumber()
    activeUsers: number;

    @ApiProperty({
        description: 'Storage used in GB',
        example: 5.2,
    })
    @IsNumber()
    storageUsed: number;

    @ApiProperty({
        description: 'API calls made this billing period',
        example: 15000,
    })
    @IsNumber()
    apiCalls: number;

    @ApiProperty({
        description: 'Last updated timestamp',
        example: '2024-01-15T12:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    lastUpdated: Date;
}

export class BillingOverviewDto {
    @ApiProperty({
        description: 'Current subscription details',
        type: SubscriptionDto,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => SubscriptionDto)
    subscription?: SubscriptionDto;

    @ApiProperty({
        description: 'List of payment methods',
        type: [PaymentMethodDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaymentMethodDto)
    paymentMethods: PaymentMethodDto[];

    @ApiProperty({
        description: 'Recent invoices',
        type: [InvoiceDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceDto)
    recentInvoices: InvoiceDto[];

    @ApiProperty({
        description: 'Current usage metrics',
        type: UsageMetricsDto,
    })
    @ValidateNested()
    @Type(() => UsageMetricsDto)
    usageMetrics: UsageMetricsDto;

    @ApiProperty({
        description: 'Next billing date',
        example: '2024-02-01T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    nextBillingDate?: Date;

    @ApiProperty({
        description: 'Amount to be charged next billing cycle',
        example: 2999,
    })
    @IsNumber()
    nextBillingAmount: number;
}

export class BillingDetailsDto {
    @ApiProperty({
        description: 'Tenant ID',
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
        description: 'Billing email',
        example: 'billing@company.com',
    })
    @IsString()
    billingEmail: string;

    @ApiProperty({
        description: 'Company name',
        example: 'Acme Corporation',
        required: false,
    })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiProperty({
        description: 'Tax ID',
        example: '12-3456789',
        required: false,
    })
    @IsOptional()
    @IsString()
    taxId?: string;

    @ApiProperty({
        description: 'Billing address line 1',
        example: '123 Main St',
        required: false,
    })
    @IsOptional()
    @IsString()
    addressLine1?: string;

    @ApiProperty({
        description: 'Billing address line 2',
        example: 'Suite 100',
        required: false,
    })
    @IsOptional()
    @IsString()
    addressLine2?: string;

    @ApiProperty({
        description: 'City',
        example: 'San Francisco',
        required: false,
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({
        description: 'State or province',
        example: 'CA',
        required: false,
    })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiProperty({
        description: 'Postal code',
        example: '94105',
        required: false,
    })
    @IsOptional()
    @IsString()
    postalCode?: string;

    @ApiProperty({
        description: 'Country code',
        example: 'US',
        required: false,
    })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty({
        description: 'Date when billing details were created',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    createdAt: Date;

    @ApiProperty({
        description: 'Date when billing details were last updated',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    updatedAt: Date;
}

export class UpdateBillingDetailsDto {
    @ApiProperty({
        description: 'Billing email',
        example: 'billing@company.com',
        required: false,
    })
    @IsOptional()
    @IsString()
    billingEmail?: string;

    @ApiProperty({
        description: 'Company name',
        example: 'Acme Corporation',
        required: false,
    })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiProperty({
        description: 'Tax ID',
        example: '12-3456789',
        required: false,
    })
    @IsOptional()
    @IsString()
    taxId?: string;

    @ApiProperty({
        description: 'Billing address line 1',
        example: '123 Main St',
        required: false,
    })
    @IsOptional()
    @IsString()
    addressLine1?: string;

    @ApiProperty({
        description: 'Billing address line 2',
        example: 'Suite 100',
        required: false,
    })
    @IsOptional()
    @IsString()
    addressLine2?: string;

    @ApiProperty({
        description: 'City',
        example: 'San Francisco',
        required: false,
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({
        description: 'State or province',
        example: 'CA',
        required: false,
    })
    @IsOptional()
    @IsString()
    state?: string;

    @ApiProperty({
        description: 'Postal code',
        example: '94105',
        required: false,
    })
    @IsOptional()
    @IsString()
    postalCode?: string;

    @ApiProperty({
        description: 'Country code',
        example: 'US',
        required: false,
    })
    @IsOptional()
    @IsString()
    country?: string;
}