import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatusDto {
    @ApiProperty({
        description: 'Invoice status category',
        example: 'paid',
        enum: ['paid', 'unpaid', 'overdue'],
    })
    @IsString()
    status!: 'paid' | 'unpaid' | 'overdue';

    @ApiProperty({
        description: 'Number of invoices in this status',
        example: 125,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices in this status',
        example: 45000.75,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 65.5,
    })
    @IsNumber()
    percentage!: number;
}

export class InvoiceAgingDto {
    @ApiProperty({
        description: 'Age range in days',
        example: '0-30',
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
        description: 'Total value of invoices in this age range',
        example: 12500.00,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total overdue amount',
        example: 25.5,
    })
    @IsNumber()
    percentage!: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({
        description: 'Invoice status breakdown',
        type: [InvoiceStatusDto],
    })
    statusBreakdown!: InvoiceStatusDto[];

    @ApiProperty({
        description: 'Aging analysis for overdue invoices',
        type: [InvoiceAgingDto],
    })
    agingAnalysis!: InvoiceAgingDto[];

    @ApiProperty({
        description: 'Total number of invoices',
        example: 500,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total invoice value',
        example: 750000.00,
    })
    @IsNumber()
    totalValue!: number;
}

export class InvoiceStatusQueryDto {
    @ApiProperty({
        description: 'Start date for status analysis',
        example: '2024-01-01',
        required: false,
    })
    @IsString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for status analysis',
        example: '2024-12-31',
        required: false,
    })
    @IsString()
    endDate?: string;

    @ApiProperty({
        description: 'Include aging analysis for overdue invoices',
        example: true,
        required: false,
    })
    includeAging?: boolean;
}