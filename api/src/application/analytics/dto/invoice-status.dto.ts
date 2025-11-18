import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatusBreakdownDto {
    @ApiProperty({
        description: 'Number of paid invoices',
        example: 850,
    })
    paid!: number;

    @ApiProperty({
        description: 'Number of unpaid invoices',
        example: 120,
    })
    unpaid!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 45,
    })
    overdue!: number;

    @ApiProperty({
        description: 'Number of pending invoices',
        example: 35,
    })
    pending!: number;
}

export class AgingAnalysisDto {
    @ApiProperty({
        description: 'Invoices 0-30 days old',
        example: 125,
    })
    current!: number;

    @ApiProperty({
        description: 'Invoices 31-60 days old',
        example: 85,
    })
    days31to60!: number;

    @ApiProperty({
        description: 'Invoices 61-90 days old',
        example: 45,
    })
    days61to90!: number;

    @ApiProperty({
        description: 'Invoices over 90 days old',
        example: 25,
    })
    over90Days!: number;
}

export class InvoiceStatusDto {
    @ApiProperty({
        description: 'Breakdown of invoices by status',
        type: InvoiceStatusBreakdownDto,
    })
    statusBreakdown!: InvoiceStatusBreakdownDto;

    @ApiProperty({
        description: 'Invoice aging analysis',
        type: AgingAnalysisDto,
    })
    agingAnalysis!: AgingAnalysisDto;

    @ApiProperty({
        description: 'Total outstanding amount from unpaid invoices',
        example: 25750.50,
    })
    totalOutstanding!: number;

    @ApiProperty({
        description: 'Average days to payment',
        example: 18.5,
    })
    averageDaysToPayment!: number;

    @ApiProperty({
        description: 'Collection rate percentage',
        example: 94.2,
    })
    collectionRate!: number;
}