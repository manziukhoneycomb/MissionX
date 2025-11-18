import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class InvoiceStatusCountDto {
    @ApiProperty({
        description: 'Status of the invoices',
        example: 'paid',
        enum: ['paid', 'unpaid', 'overdue'],
    })
    @IsString()
    status!: string;

    @ApiProperty({
        description: 'Number of invoices with this status',
        example: 125,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total amount for invoices with this status',
        example: 45000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 62.5,
    })
    @IsNumber()
    percentage!: number;
}

export class AgingAnalysisDto {
    @ApiProperty({
        description: 'Age range in days (e.g., "0-30", "31-60")',
        example: '0-30',
    })
    @IsString()
    ageRange!: string;

    @ApiProperty({
        description: 'Number of invoices in this age range',
        example: 25,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total amount for invoices in this age range',
        example: 12000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total overdue amount',
        example: 35.5,
    })
    @IsNumber()
    percentageOfOverdue!: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({
        description: 'Breakdown of invoices by status',
        type: [InvoiceStatusCountDto],
    })
    statusBreakdown!: InvoiceStatusCountDto[];

    @ApiProperty({
        description: 'Aging analysis for overdue invoices',
        type: [AgingAnalysisDto],
    })
    agingAnalysis!: AgingAnalysisDto[];

    @ApiProperty({
        description: 'Total number of invoices',
        example: 200,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total invoice amount across all statuses',
        example: 125000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Collection rate percentage',
        example: 85.5,
    })
    @IsNumber()
    collectionRate!: number;
}