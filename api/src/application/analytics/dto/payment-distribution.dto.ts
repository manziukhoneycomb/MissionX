import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDistributionDto {
    @ApiProperty({
        description: 'Payment method type',
        example: 'credit_card',
    })
    method!: string;

    @ApiProperty({
        description: 'Number of payments using this method',
        example: 75,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount paid using this method',
        example: 45000.75,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 45.5,
    })
    percentage!: number;
}

export class PaymentTimingDistributionDto {
    @ApiProperty({
        description: 'Payment timing category',
        enum: ['early', 'on_time', 'late', 'very_late'],
        example: 'on_time',
    })
    timing!: 'early' | 'on_time' | 'late' | 'very_late';

    @ApiProperty({
        description: 'Number of payments in this category',
        example: 85,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount for payments in this category',
        example: 52000.25,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 52.3,
    })
    percentage!: number;

    @ApiProperty({
        description: 'Average days from due date (negative for early payments)',
        example: -2.5,
    })
    averageDaysFromDue!: number;
}

export class PaymentAmountRangeDto {
    @ApiProperty({
        description: 'Amount range description',
        example: '$1,000 - $5,000',
    })
    range!: string;

    @ApiProperty({
        description: 'Minimum amount in range',
        example: 1000,
    })
    minAmount!: number;

    @ApiProperty({
        description: 'Maximum amount in range',
        example: 5000,
    })
    maxAmount!: number;

    @ApiProperty({
        description: 'Number of payments in this range',
        example: 35,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount for payments in this range',
        example: 87500.50,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 22.8,
    })
    percentage!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Distribution of payments by method',
        type: [PaymentMethodDistributionDto],
    })
    methodDistribution!: PaymentMethodDistributionDto[];

    @ApiProperty({
        description: 'Distribution of payments by timing',
        type: [PaymentTimingDistributionDto],
    })
    timingDistribution!: PaymentTimingDistributionDto[];

    @ApiProperty({
        description: 'Distribution of payments by amount range',
        type: [PaymentAmountRangeDto],
    })
    amountRangeDistribution!: PaymentAmountRangeDto[];

    @ApiProperty({
        description: 'Total number of payments analyzed',
        example: 165,
    })
    totalPayments!: number;

    @ApiProperty({
        description: 'Total payment amount analyzed',
        example: 125000.75,
    })
    totalAmount!: number;
}