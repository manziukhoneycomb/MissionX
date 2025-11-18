import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendDataPointDto {
    @ApiProperty({
        description: 'Date for the data point',
        example: '2024-01-15',
    })
    date: string;

    @ApiProperty({
        description: 'Revenue amount for the date',
        example: 15000.50,
    })
    revenue: number;

    @ApiProperty({
        description: 'Number of invoices for the date',
        example: 25,
    })
    invoiceCount: number;
}

export class TopCustomerDto {
    @ApiProperty({
        description: 'Customer name',
        example: 'Acme Corporation',
    })
    customerName: string;

    @ApiProperty({
        description: 'Total revenue from customer',
        example: 45000.75,
    })
    totalRevenue: number;

    @ApiProperty({
        description: 'Number of invoices from customer',
        example: 12,
    })
    invoiceCount: number;

    @ApiProperty({
        description: 'Percentage of total revenue',
        example: 15.5,
    })
    revenuePercentage: number;
}

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Payment status or method',
        example: 'Paid',
    })
    label: string;

    @ApiProperty({
        description: 'Amount for this category',
        example: 25000.00,
    })
    value: number;

    @ApiProperty({
        description: 'Number of invoices in this category',
        example: 45,
    })
    count: number;

    @ApiProperty({
        description: 'Percentage of total',
        example: 35.5,
    })
    percentage: number;
}

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Revenue trend data points over time',
        type: [RevenueTrendDataPointDto],
    })
    trendData: RevenueTrendDataPointDto[];

    @ApiProperty({
        description: 'Total revenue for the period',
        example: 125000.75,
    })
    totalRevenue: number;

    @ApiProperty({
        description: 'Average revenue per invoice',
        example: 2500.50,
    })
    averageInvoiceValue: number;

    @ApiProperty({
        description: 'Total number of invoices',
        example: 50,
    })
    totalInvoices: number;

    @ApiProperty({
        description: 'Revenue growth percentage compared to previous period',
        example: 12.5,
    })
    growthPercentage: number;

    @ApiProperty({
        description: 'Top customers by revenue',
        type: [TopCustomerDto],
    })
    topCustomers: TopCustomerDto[];

    @ApiProperty({
        description: 'Payment distribution breakdown',
        type: [PaymentDistributionDto],
    })
    paymentDistribution: PaymentDistributionDto[];
}