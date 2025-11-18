import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendDataPointDto {
    @ApiProperty({ description: 'Date of the data point' })
    date: string;

    @ApiProperty({ description: 'Revenue amount for the date' })
    revenue: number;

    @ApiProperty({ description: 'Number of invoices for the date' })
    invoiceCount: number;
}

export class RevenueTrendDto {
    @ApiProperty({ 
        description: 'Revenue trend data points',
        type: [RevenueTrendDataPointDto]
    })
    data: RevenueTrendDataPointDto[];

    @ApiProperty({ description: 'Total revenue for the period' })
    totalRevenue: number;

    @ApiProperty({ description: 'Total number of invoices' })
    totalInvoices: number;

    @ApiProperty({ description: 'Average revenue per day' })
    averageRevenuePerDay: number;

    @ApiProperty({ description: 'Growth percentage compared to previous period' })
    growthPercentage?: number;
}

export class MonthlyRevenueDto {
    @ApiProperty({ description: 'Year' })
    year: number;

    @ApiProperty({ description: 'Month (1-12)' })
    month: number;

    @ApiProperty({ description: 'Revenue amount for the month' })
    revenue: number;

    @ApiProperty({ description: 'Number of invoices for the month' })
    invoiceCount: number;
}

export class QuarterlyRevenueDto {
    @ApiProperty({ description: 'Year' })
    year: number;

    @ApiProperty({ description: 'Quarter (1-4)' })
    quarter: number;

    @ApiProperty({ description: 'Revenue amount for the quarter' })
    revenue: number;

    @ApiProperty({ description: 'Number of invoices for the quarter' })
    invoiceCount: number;
}