import { ApiProperty } from '@nestjs/swagger';

export class StatusCountDto {
    @ApiProperty({
        description: 'Status label',
        example: 'Paid',
    })
    status: string;

    @ApiProperty({
        description: 'Number of invoices with this status',
        example: 45,
    })
    count: number;

    @ApiProperty({
        description: 'Total amount for this status',
        example: 125000.75,
    })
    amount: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 65.5,
    })
    percentage: number;
}

export class AgingBracketDto {
    @ApiProperty({
        description: 'Age range description',
        example: '0-30 days',
    })
    ageRange: string;

    @ApiProperty({
        description: 'Number of invoices in this age bracket',
        example: 15,
    })
    count: number;

    @ApiProperty({
        description: 'Total amount in this age bracket',
        example: 35000.50,
    })
    amount: number;

    @ApiProperty({
        description: 'Percentage of total outstanding amount',
        example: 25.5,
    })
    percentage: number;
}

export class OverdueInvoiceDto {
    @ApiProperty({
        description: 'Invoice ID',
        example: 'invoice-123',
    })
    invoiceId: string;

    @ApiProperty({
        description: 'Invoice number',
        example: 'INV-2024-001',
    })
    invoiceNumber: string;

    @ApiProperty({
        description: 'Customer name',
        example: 'Acme Corporation',
    })
    customerName: string;

    @ApiProperty({
        description: 'Invoice total amount',
        example: 5000.00,
    })
    totalAmount: number;

    @ApiProperty({
        description: 'Due date',
        example: '2024-01-15',
    })
    dueDate: string;

    @ApiProperty({
        description: 'Days overdue',
        example: 15,
    })
    daysOverdue: number;
}

export class InvoiceStatusDto {
    @ApiProperty({
        description: 'Status breakdown counts and amounts',
        type: [StatusCountDto],
    })
    statusCounts: StatusCountDto[];

    @ApiProperty({
        description: 'Aging analysis for outstanding invoices',
        type: [AgingBracketDto],
    })
    agingAnalysis: AgingBracketDto[];

    @ApiProperty({
        description: 'Top overdue invoices',
        type: [OverdueInvoiceDto],
    })
    overdueInvoices: OverdueInvoiceDto[];

    @ApiProperty({
        description: 'Total outstanding amount',
        example: 75000.25,
    })
    totalOutstanding: number;

    @ApiProperty({
        description: 'Average days to payment',
        example: 18.5,
    })
    averageDaysToPayment: number;

    @ApiProperty({
        description: 'Collection efficiency percentage',
        example: 92.5,
    })
    collectionEfficiency: number;
}