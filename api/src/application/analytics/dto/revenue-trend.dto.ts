import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendDataPointDto {
    @ApiProperty({
        description: 'Date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    date!: string;

    @ApiProperty({
        description: 'Revenue amount for the period',
        example: 15500.75,
    })
    amount!: number;

    @ApiProperty({
        description: 'Number of invoices in this period',
        example: 25,
    })
    invoiceCount!: number;
}

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Array of revenue data points',
        type: [RevenueTrendDataPointDto],
    })
    dataPoints!: RevenueTrendDataPointDto[];

    @ApiProperty({
        description: 'Total revenue for the period',
        example: 125000.50,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average revenue per period',
        example: 10416.71,
    })
    averageRevenue!: number;

    @ApiProperty({
        description: 'Growth percentage compared to previous period',
        example: 12.5,
    })
    growthPercentage!: number;
}