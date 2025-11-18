import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
    @ApiProperty({
        description: 'Payment method name',
        example: 'Credit Card',
    })
    method!: string;

    @ApiProperty({
        description: 'Count of payments using this method',
        example: 345,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount paid using this method',
        example: 45250.75,
    })
    amount!: number;

    @ApiProperty({
        description: 'Percentage of total payments using this method',
        example: 35.2,
    })
    percentage!: number;
}

export class PaymentSizeDistributionDto {
    @ApiProperty({
        description: 'Range description (e.g., "$0 - $100")',
        example: '$0 - $100',
    })
    range!: string;

    @ApiProperty({
        description: 'Count of payments in this range',
        example: 125,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount in this range',
        example: 8750.25,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of payments in this range',
        example: 15.8,
    })
    percentage!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Payment methods breakdown',
        type: [PaymentMethodDto],
    })
    paymentMethods!: PaymentMethodDto[];

    @ApiProperty({
        description: 'Payment size distribution',
        type: [PaymentSizeDistributionDto],
    })
    paymentSizeDistribution!: PaymentSizeDistributionDto[];

    @ApiProperty({
        description: 'Average payment amount',
        example: 275.50,
    })
    averagePaymentAmount!: number;

    @ApiProperty({
        description: 'Median payment amount',
        example: 185.25,
    })
    medianPaymentAmount!: number;

    @ApiProperty({
        description: 'Most common payment method',
        example: 'Bank Transfer',
    })
    mostCommonPaymentMethod!: string;
}