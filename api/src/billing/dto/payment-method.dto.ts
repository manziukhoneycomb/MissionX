import { IsString, IsEnum, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethodType {
    CARD = 'card',
    BANK_ACCOUNT = 'us_bank_account',
    SEPA_DEBIT = 'sepa_debit',
}

export class CardDetailsDto {
    @ApiProperty({
        description: 'Card brand',
        example: 'visa',
    })
    @IsString()
    brand: string;

    @ApiProperty({
        description: 'Last 4 digits of the card',
        example: '4242',
    })
    @IsString()
    last4: string;

    @ApiProperty({
        description: 'Card expiration month',
        example: 12,
    })
    expMonth: number;

    @ApiProperty({
        description: 'Card expiration year',
        example: 2025,
    })
    expYear: number;

    @ApiProperty({
        description: 'Country code of the card',
        example: 'US',
    })
    @IsString()
    country: string;
}

export class PaymentMethodDto {
    @ApiProperty({
        description: 'Payment method ID',
        example: 'pm_1234567890',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Stripe payment method ID',
        example: 'pm_1234567890',
    })
    @IsString()
    stripePaymentMethodId: string;

    @ApiProperty({
        description: 'Tenant ID associated with the payment method',
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
        description: 'Type of payment method',
        enum: PaymentMethodType,
        example: PaymentMethodType.CARD,
    })
    @IsEnum(PaymentMethodType)
    type: PaymentMethodType;

    @ApiProperty({
        description: 'Whether this is the default payment method',
        example: true,
    })
    @IsBoolean()
    isDefault: boolean;

    @ApiProperty({
        description: 'Card details if payment method is a card',
        type: CardDetailsDto,
        required: false,
    })
    @IsOptional()
    card?: CardDetailsDto;

    @ApiProperty({
        description: 'Date when payment method was created',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsDate()
    @Type(() => Date)
    createdAt: Date;
}

export class AddPaymentMethodDto {
    @ApiProperty({
        description: 'Tenant ID for the payment method',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    tenantId: string;

    @ApiProperty({
        description: 'Stripe payment method ID',
        example: 'pm_1234567890',
    })
    @IsString()
    stripePaymentMethodId: string;

    @ApiProperty({
        description: 'Whether to set this as the default payment method',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    setAsDefault?: boolean;
}

export class UpdatePaymentMethodDto {
    @ApiProperty({
        description: 'Whether to set this as the default payment method',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    setAsDefault?: boolean;
}