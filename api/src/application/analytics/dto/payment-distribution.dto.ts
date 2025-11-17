import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
    @ApiProperty({ description: 'Payment method name', example: 'Credit Card' })
    method!: string;

    @ApiProperty({ description: 'Number of transactions', example: 45 })
    count!: number;

    @ApiProperty({ description: 'Total amount processed', example: 25000.50 })
    totalAmount!: number;

    @ApiProperty({ description: 'Percentage of total payments', example: 35.5 })
    percentage!: number;

    @ApiProperty({ description: 'Average transaction amount', example: 555.56 })
    averageAmount!: number;
}

export class PaymentTimingDto {
    @ApiProperty({ description: 'Timing category', example: 'Early (0-15 days)' })
    category!: string;

    @ApiProperty({ description: 'Number of payments', example: 23 })
    count!: number;

    @ApiProperty({ description: 'Total amount', example: 12500.25 })
    totalAmount!: number;

    @ApiProperty({ description: 'Percentage of payments', example: 51.1 })
    percentage!: number;

    @ApiProperty({ description: 'Average days to payment', example: 8.5 })
    averageDays!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({ description: 'Payment method breakdown', type: [PaymentMethodDto] })
    paymentMethods!: PaymentMethodDto[];

    @ApiProperty({ description: 'Payment timing analysis', type: [PaymentTimingDto] })
    paymentTiming!: PaymentTimingDto[];

    @ApiProperty({ description: 'Total processed payments', example: 156 })
    totalPayments!: number;

    @ApiProperty({ description: 'Total payment amount', example: 87500.50 })
    totalAmount!: number;

    @ApiProperty({ description: 'Average payment amount', example: 561.22 })
    averagePaymentAmount!: number;

    @ApiProperty({ description: 'Average days to payment across all invoices', example: 15.3 })
    averageDaysToPayment!: number;
}