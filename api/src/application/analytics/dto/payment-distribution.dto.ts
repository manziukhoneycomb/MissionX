import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
    @ApiProperty({ description: 'Payment method name' })
    method: string;

    @ApiProperty({ description: 'Number of payments using this method' })
    count: number;

    @ApiProperty({ description: 'Total amount paid using this method' })
    totalAmount: number;

    @ApiProperty({ description: 'Percentage of total payments' })
    percentage: number;
}

export class PaymentDistributionDto {
    @ApiProperty({ 
        description: 'Payment method breakdown',
        type: [PaymentMethodDto]
    })
    paymentMethods: PaymentMethodDto[];

    @ApiProperty({ description: 'Total number of payments' })
    totalPayments: number;

    @ApiProperty({ description: 'Total payment amount' })
    totalAmount: number;

    @ApiProperty({ description: 'Average payment amount' })
    averagePaymentAmount: number;
}

export class InvoiceAmountRangeDto {
    @ApiProperty({ description: 'Amount range (e.g., "$0-$1,000")' })
    range: string;

    @ApiProperty({ description: 'Number of invoices in this range' })
    count: number;

    @ApiProperty({ description: 'Total amount for invoices in this range' })
    totalAmount: number;

    @ApiProperty({ description: 'Percentage of total invoices' })
    percentage: number;
}

export class InvoiceValueDistributionDto {
    @ApiProperty({ 
        description: 'Invoice amount range breakdown',
        type: [InvoiceAmountRangeDto]
    })
    valueRanges: InvoiceAmountRangeDto[];

    @ApiProperty({ description: 'Total number of invoices' })
    totalInvoices: number;

    @ApiProperty({ description: 'Total invoice value' })
    totalValue: number;

    @ApiProperty({ description: 'Median invoice value' })
    medianValue: number;

    @ApiProperty({ description: 'Average invoice value' })
    averageValue: number;

    @ApiProperty({ description: 'Highest invoice value' })
    highestValue: number;

    @ApiProperty({ description: 'Lowest invoice value' })
    lowestValue: number;
}