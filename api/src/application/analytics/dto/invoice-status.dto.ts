import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class InvoiceStatusBreakdownDto {
    @ApiProperty({
        description: 'Status name',
        example: 'paid',
    })
    @IsString()
    status!: string;

    @ApiProperty({
        description: 'Number of invoices with this status',
        example: 120,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total amount for invoices with this status',
        example: 85000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 75.5,
    })
    @IsNumber()
    percentage!: number;
}

export class AgingAnalysisDto {
    @ApiProperty({
        description: 'Age range description',
        example: '0-30 days',
    })
    @IsString()
    ageRange!: string;

    @ApiProperty({
        description: 'Number of invoices in this age range',
        example: 45,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total amount for invoices in this age range',
        example: 25000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Average days overdue',
        example: 15,
    })
    @IsNumber()
    averageDaysOverdue!: number;
}

export class InvoiceStatusDto {
    @ApiProperty({
        description: 'Total number of invoices',
        example: 200,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 120,
    })
    @IsNumber()
    paidCount!: number;

    @ApiProperty({
        description: 'Number of unpaid invoices',
        example: 65,
    })
    @IsNumber()
    unpaidCount!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 15,
    })
    @IsNumber()
    overdueCount!: number;

    @ApiProperty({
        description: 'Detailed status breakdown',
        type: [InvoiceStatusBreakdownDto],
    })
    statusBreakdown!: InvoiceStatusBreakdownDto[];

    @ApiProperty({
        description: 'Aging analysis for unpaid invoices',
        type: [AgingAnalysisDto],
    })
    agingAnalysis!: AgingAnalysisDto[];
}