import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RevenueTrendPointDto {
    @ApiProperty({ description: 'Period label', example: '2024-01' })
    period!: string;

    @ApiProperty({ description: 'Revenue amount for the period', example: 25000.50 })
    revenue!: number;

    @ApiProperty({ description: 'Number of invoices in the period', example: 45 })
    invoiceCount!: number;

    @ApiProperty({ description: 'Date of the period start', example: '2024-01-01' })
    date!: string;
}

export class RevenueTrendDto {
    @ApiProperty({ description: 'Revenue trend data points', type: [RevenueTrendPointDto] })
    data!: RevenueTrendPointDto[];

    @ApiProperty({ description: 'Total revenue for the entire period', example: 125000.50 })
    totalRevenue!: number;

    @ApiProperty({ description: 'Total number of invoices', example: 234 })
    totalInvoices!: number;

    @ApiProperty({ description: 'Average revenue per period', example: 10416.71 })
    averageRevenuePerPeriod!: number;

    @ApiProperty({ description: 'Period type used for aggregation', example: 'monthly' })
    periodType!: string;
}

export class TopCustomerDto {
    @ApiProperty({ description: 'Customer name', example: 'ABC Corporation' })
    customerName!: string;

    @ApiProperty({ description: 'Total revenue from customer', example: 15000.50 })
    totalRevenue!: number;

    @ApiProperty({ description: 'Number of invoices', example: 12 })
    invoiceCount!: number;

    @ApiProperty({ description: 'Average invoice value', example: 1250.04 })
    averageInvoiceValue!: number;

    @ApiProperty({ description: 'Customer ranking by revenue', example: 1 })
    rank!: number;
}