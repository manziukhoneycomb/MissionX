import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Date for the revenue data point',
        example: '2024-01-01',
    })
    @IsDateString()
    date!: string;

    @ApiProperty({
        description: 'Total revenue for the period',
        example: 15000.50,
    })
    @IsNumber()
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices for the period',
        example: 45,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Period type (daily, weekly, monthly)',
        example: 'monthly',
    })
    @IsString()
    period!: string;
}

export class RevenueMetricsDto {
    @ApiProperty({
        description: 'Total revenue for the selected period',
        example: 125000.75,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average revenue per invoice',
        example: 2500.15,
    })
    @IsNumber()
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Revenue growth percentage compared to previous period',
        example: 12.5,
    })
    @IsNumber()
    growthPercentage!: number;

    @ApiProperty({
        description: 'Revenue trend data points',
        type: [RevenueTrendDto],
    })
    trends!: RevenueTrendDto[];
}