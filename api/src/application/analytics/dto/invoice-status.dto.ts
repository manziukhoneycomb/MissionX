import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatusCountDto {
    @ApiProperty({
        description: 'Status category',
        example: 'Paid',
    })
    status!: string;

    @ApiProperty({
        description: 'Number of invoices with this status',
        example: 125,
    })
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices with this status',
        example: 45750.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 62.5,
    })
    percentage!: number;
}

export class AgingBucketDto {
    @ApiProperty({
        description: 'Aging range description',
        example: '0-30 days',
    })
    range!: string;

    @ApiProperty({
        description: 'Number of invoices in this aging bucket',
        example: 15,
    })
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices in this bucket',
        example: 8500.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Average days overdue in this bucket',
        example: 15.5,
    })
    averageDaysOverdue!: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({
        description: 'Invoice status breakdown',
        type: [InvoiceStatusCountDto],
    })
    statusBreakdown!: InvoiceStatusCountDto[];

    @ApiProperty({
        description: 'Aging analysis for overdue invoices',
        type: [AgingBucketDto],
    })
    agingAnalysis!: AgingBucketDto[];

    @ApiProperty({
        description: 'Total number of invoices',
        example: 200,
    })
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total outstanding amount',
        example: 75000.00,
    })
    totalOutstanding!: number;

    @ApiProperty({
        description: 'Collection efficiency percentage',
        example: 92.5,
    })
    collectionEfficiency!: number;
}