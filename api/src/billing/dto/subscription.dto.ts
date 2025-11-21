import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELED = 'canceled',
    INCOMPLETE = 'incomplete',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    PAST_DUE = 'past_due',
    TRIALING = 'trialing',
    UNPAID = 'unpaid',
}

export class SubscriptionDto {
    @ApiProperty({
        description: 'Subscription ID',
        example: 'sub_1234567890',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Stripe subscription ID',
        example: 'sub_1234567890',
    })
    @IsString()
    stripeSubscriptionId: string;

    @ApiProperty({
        description: 'Tenant ID associated with the subscription',
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
        description: 'Price ID from Stripe',
        example: 'price_1234567890',
    })
    @IsString()
    stripePriceId: string;

    @ApiProperty({
        description: 'Subscription status',
        enum: SubscriptionStatus,
        example: SubscriptionStatus.ACTIVE,
    })
    @IsEnum(SubscriptionStatus)
    status: SubscriptionStatus;

    @ApiProperty({
        description: 'Current billing period start',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    currentPeriodStart: Date;

    @ApiProperty({
        description: 'Current billing period end',
        example: '2024-02-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    currentPeriodEnd: Date;

    @ApiProperty({
        description: 'Trial end date if applicable',
        example: '2024-01-15T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    trialEnd?: Date;

    @ApiProperty({
        description: 'Cancellation date if applicable',
        example: '2024-01-15T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    canceledAt?: Date;

    @ApiProperty({
        description: 'Date when subscription was created',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    createdAt: Date;

    @ApiProperty({
        description: 'Date when subscription was last updated',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    updatedAt: Date;
}

export class CreateSubscriptionDto {
    @ApiProperty({
        description: 'Tenant ID for the subscription',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    tenantId: string;

    @ApiProperty({
        description: 'Stripe price ID for the subscription',
        example: 'price_1234567890',
    })
    @IsString()
    stripePriceId: string;

    @ApiProperty({
        description: 'Customer email',
        example: 'admin@company.com',
    })
    @IsString()
    customerEmail: string;

    @ApiProperty({
        description: 'Trial period in days (optional)',
        example: 14,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    trialPeriodDays?: number;
}

export class UpdateSubscriptionDto {
    @ApiProperty({
        description: 'New price ID for the subscription',
        example: 'price_0987654321',
        required: false,
    })
    @IsOptional()
    @IsString()
    stripePriceId?: string;

    @ApiProperty({
        description: 'Whether to prorate the subscription change',
        example: true,
        required: false,
    })
    @IsOptional()
    prorationBehavior?: 'none' | 'create_prorations' | 'always_invoice';
}