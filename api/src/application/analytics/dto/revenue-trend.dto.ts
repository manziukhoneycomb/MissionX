import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendDataPointDto {
    @ApiProperty({
        description: 'Date for the data point (YYYY-MM-DD format)',
        example: '2024-01-01',
    })
    date!: string;

    @ApiProperty({
        description: 'Total revenue for the period',
        example: 15000.50,
    })
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices for the period',
        example: 25,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice value for the period',
        example: 600.02,
    })
    averageValue!: number;
}

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Array of revenue data points over time',
        type: [RevenueTrendDataPointDto],
    })
    dataPoints!: RevenueTrendDataPointDto[];

    @ApiProperty({
        description: 'Period type for aggregation',
        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
        example: 'monthly',
    })
    period!: 'daily' | 'weekly' | 'monthly' | 'quarterly';

    @ApiProperty({
        description: 'Total revenue for the entire period',
        example: 125000.50,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Growth rate compared to previous period (percentage)',
        example: 12.5,
    })
    growthRate!: number;
}