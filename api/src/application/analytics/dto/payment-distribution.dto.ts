import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
    @ApiProperty({
        description: 'Payment method name',
        example: 'Credit Card',
    })
    method!: string;

    @ApiProperty({
        description: 'Number of payments using this method',
        example: 85,
    })
    count!: number;

    @ApiProperty({
        description: 'Total value of payments using this method',
        example: 42500.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 45.2,
    })
    percentage!: number;

    @ApiProperty({
        description: 'Average payment amount for this method',
        example: 500.00,
    })
    averageAmount!: number;
}

export class PaymentTimingDto {
    @ApiProperty({
        description: 'Payment timing category',
        example: 'Early',
    })
    category!: string;

    @ApiProperty({
        description: 'Number of payments in this category',
        example: 25,
    })
    count!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 15.5,
    })
    percentage!: number;

    @ApiProperty({
        description: 'Average days relative to due date',
        example: -5.2,
    })
    averageDaysFromDue!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Payment method distribution',
        type: [PaymentMethodDto],
    })
    paymentMethods!: PaymentMethodDto[];

    @ApiProperty({
        description: 'Payment timing analysis',
        type: [PaymentTimingDto],
    })
    paymentTiming!: PaymentTimingDto[];

    @ApiProperty({
        description: 'Total number of payments',
        example: 188,
    })
    totalPayments!: number;

    @ApiProperty({
        description: 'Average payment amount',
        example: 650.75,
    })
    averagePaymentAmount!: number;

    @ApiProperty({
        description: 'Most popular payment method',
        example: 'Credit Card',
    })
    popularPaymentMethod!: string;
}