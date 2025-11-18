import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CustomerPaymentStatsDto {
    @ApiProperty({
        description: 'Customer name',
        example: 'Acme Corporation',
    })
    @IsString()
    customerName!: string;

    @ApiProperty({
        description: 'Total amount from this customer',
        example: 15000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Number of invoices from this customer',
        example: 12,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average payment amount from this customer',
        example: 1250.00,
    })
    @IsNumber()
    averagePayment!: number;

    @ApiProperty({
        description: 'Percentage of total revenue',
        example: 18.5,
    })
    @IsNumber()
    revenuePercentage!: number;
}

export class PaymentAmountRangeDto {
    @ApiProperty({
        description: 'Amount range (e.g., "$0-$1000")',
        example: '$1000-$5000',
    })
    @IsString()
    range!: string;

    @ApiProperty({
        description: 'Number of payments in this range',
        example: 45,
    })
    @IsNumber()
    paymentCount!: number;

    @ApiProperty({
        description: 'Total amount for payments in this range',
        example: 125000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 22.5,
    })
    @IsNumber()
    percentage!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Top customers by payment amount',
        type: [CustomerPaymentStatsDto],
    })
    topCustomers!: CustomerPaymentStatsDto[];

    @ApiProperty({
        description: 'Distribution of payments by amount ranges',
        type: [PaymentAmountRangeDto],
    })
    amountDistribution!: PaymentAmountRangeDto[];

    @ApiProperty({
        description: 'Average payment amount across all customers',
        example: 875.50,
    })
    @IsNumber()
    averagePaymentAmount!: number;

    @ApiProperty({
        description: 'Median payment amount',
        example: 650.00,
    })
    @IsNumber()
    medianPaymentAmount!: number;

    @ApiProperty({
        description: 'Total unique customers',
        example: 85,
    })
    @IsNumber()
    totalCustomers!: number;
}