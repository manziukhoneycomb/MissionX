import { ApiProperty } from '@nestjs/swagger';

export enum InvoiceStatus {
    PAID = 'paid',
    UNPAID = 'unpaid',
    OVERDUE = 'overdue'
}

export class InvoiceStatusCountDto {
    @ApiProperty({ description: 'Invoice status', enum: InvoiceStatus })
    status: InvoiceStatus;

    @ApiProperty({ description: 'Number of invoices with this status' })
    count: number;

    @ApiProperty({ description: 'Total amount for invoices with this status' })
    totalAmount: number;

    @ApiProperty({ description: 'Percentage of total invoices' })
    percentage: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({ 
        description: 'Breakdown by invoice status',
        type: [InvoiceStatusCountDto]
    })
    statusBreakdown: InvoiceStatusCountDto[];

    @ApiProperty({ description: 'Total number of invoices' })
    totalInvoices: number;

    @ApiProperty({ description: 'Total amount across all invoices' })
    totalAmount: number;

    @ApiProperty({ description: 'Collection rate (paid / total)' })
    collectionRate: number;
}

export class AgingAnalysisDto {
    @ApiProperty({ description: 'Age range (e.g., "0-30 days")' })
    ageRange: string;

    @ApiProperty({ description: 'Number of invoices in this age range' })
    count: number;

    @ApiProperty({ description: 'Total amount for invoices in this age range' })
    totalAmount: number;

    @ApiProperty({ description: 'Percentage of total unpaid amount' })
    percentage: number;
}

export class InvoiceAgingDto {
    @ApiProperty({ 
        description: 'Aging analysis breakdown',
        type: [AgingAnalysisDto]
    })
    agingBreakdown: AgingAnalysisDto[];

    @ApiProperty({ description: 'Total unpaid amount' })
    totalUnpaidAmount: number;

    @ApiProperty({ description: 'Average days outstanding' })
    averageDaysOutstanding: number;

    @ApiProperty({ description: 'Oldest unpaid invoice days' })
    oldestUnpaidDays: number;
}