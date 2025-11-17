import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatusCountDto {
    @ApiProperty({
        description: 'Invoice status category',
        enum: ['paid', 'unpaid', 'overdue', 'partial'],
        example: 'paid',
    })
    status!: 'paid' | 'unpaid' | 'overdue' | 'partial';

    @ApiProperty({
        description: 'Number of invoices in this status',
        example: 120,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount for invoices in this status',
        example: 75000.50,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 60.5,
    })
    percentage!: number;
}

export class AgingAnalysisDto {
    @ApiProperty({
        description: 'Aging bracket (days)',
        example: '0-30',
    })
    agingBracket!: string;

    @ApiProperty({
        description: 'Number of invoices in this bracket',
        example: 45,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount for invoices in this bracket',
        example: 25000.75,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total outstanding amount',
        example: 35.2,
    })
    percentage!: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({
        description: 'Breakdown of invoices by status',
        type: [InvoiceStatusCountDto],
    })
    statusCounts!: InvoiceStatusCountDto[];

    @ApiProperty({
        description: 'Aging analysis for unpaid invoices',
        type: [AgingAnalysisDto],
    })
    agingAnalysis!: AgingAnalysisDto[];

    @ApiProperty({
        description: 'Total number of invoices',
        example: 200,
    })
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total outstanding amount',
        example: 45000.25,
    })
    totalOutstanding!: number;

    @ApiProperty({
        description: 'Collection rate percentage (0-100)',
        example: 85.5,
    })
    collectionRate!: number;
}