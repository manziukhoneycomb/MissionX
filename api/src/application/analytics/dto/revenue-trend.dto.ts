import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendPointDto {
    @ApiProperty({
        description: 'Period label (e.g., month/quarter)',
        example: '2023-01',
    })
    period!: string;

    @ApiProperty({
        description: 'Revenue amount for this period',
        example: 12500.50,
    })
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices in this period',
        example: 45,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice value for this period',
        example: 277.78,
    })
    averageInvoiceValue!: number;
}

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Revenue trend data points',
        type: [RevenueTrendPointDto],
    })
    data!: RevenueTrendPointDto[];

    @ApiProperty({
        description: 'Total revenue growth percentage compared to previous period',
        example: 15.5,
    })
    growthPercentage!: number;

    @ApiProperty({
        description: 'Peak revenue period',
        example: '2023-12',
    })
    peakPeriod!: string;

    @ApiProperty({
        description: 'Peak revenue amount',
        example: 18750.25,
    })
    peakRevenue!: number;
}