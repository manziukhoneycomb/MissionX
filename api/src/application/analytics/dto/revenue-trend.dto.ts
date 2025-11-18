import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class RevenueTrendDto {
    @ApiProperty({
        description: 'The period for the revenue data (e.g., 2024-01)',
        example: '2024-01',
    })
    @IsString()
    period!: string;

    @ApiProperty({
        description: 'The start date of the period',
        example: '2024-01-01',
    })
    @IsDate()
    startDate!: string;

    @ApiProperty({
        description: 'The end date of the period',
        example: '2024-01-31',
    })
    @IsDate()
    endDate!: string;

    @ApiProperty({
        description: 'Total revenue for the period',
        example: 15000.00,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Number of invoices for the period',
        example: 25,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice amount for the period',
        example: 600.00,
    })
    @IsNumber()
    averageInvoiceAmount!: number;
}

export class RevenueAnalyticsDto {
    @ApiProperty({
        description: 'Monthly revenue trends',
        type: [RevenueTrendDto],
    })
    monthlyTrends!: RevenueTrendDto[];

    @ApiProperty({
        description: 'Quarterly revenue trends',
        type: [RevenueTrendDto],
    })
    quarterlyTrends!: RevenueTrendDto[];

    @ApiProperty({
        description: 'Total revenue across all periods',
        example: 180000.00,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Revenue growth percentage compared to previous period',
        example: 12.5,
    })
    @IsNumber()
    growthPercentage!: number;
}