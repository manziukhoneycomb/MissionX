import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatusCountDto {
    @ApiProperty({ description: 'Status name', example: 'Paid' })
    status!: string;

    @ApiProperty({ description: 'Number of invoices with this status', example: 156 })
    count!: number;

    @ApiProperty({ description: 'Total amount for invoices with this status', example: 75000.50 })
    totalAmount!: number;

    @ApiProperty({ description: 'Percentage of total invoices', example: 67.2 })
    percentage!: number;
}

export class AgingBucketDto {
    @ApiProperty({ description: 'Age range label', example: '0-30 days' })
    ageRange!: string;

    @ApiProperty({ description: 'Number of days (start)', example: 0 })
    minDays!: number;

    @ApiProperty({ description: 'Number of days (end)', example: 30 })
    maxDays!: number;

    @ApiProperty({ description: 'Number of invoices in this bucket', example: 25 })
    count!: number;

    @ApiProperty({ description: 'Total amount for invoices in this bucket', example: 12500.75 })
    totalAmount!: number;

    @ApiProperty({ description: 'Percentage of unpaid invoices', example: 45.5 })
    percentage!: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({ description: 'Status breakdown', type: [InvoiceStatusCountDto] })
    statusCounts!: InvoiceStatusCountDto[];

    @ApiProperty({ description: 'Aging analysis for unpaid invoices', type: [AgingBucketDto] })
    agingAnalysis!: AgingBucketDto[];

    @ApiProperty({ description: 'Total number of invoices', example: 234 })
    totalInvoices!: number;

    @ApiProperty({ description: 'Total invoice amount', example: 125000.50 })
    totalAmount!: number;

    @ApiProperty({ description: 'Amount of paid invoices', example: 100000.25 })
    paidAmount!: number;

    @ApiProperty({ description: 'Amount of unpaid invoices', example: 25000.25 })
    unpaidAmount!: number;

    @ApiProperty({ description: 'Overall collection rate as percentage', example: 80.0 })
    collectionRate!: number;
}