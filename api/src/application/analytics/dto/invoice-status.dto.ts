import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceStatusCountDto {
    @ApiProperty({
        description: 'Invoice status',
        example: 'paid',
    })
    status!: 'paid' | 'unpaid' | 'overdue';

    @ApiProperty({
        description: 'Number of invoices with this status',
        example: 85,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total amount for invoices with this status',
        example: 127500.75,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 68.5,
    })
    @IsNumber()
    percentage!: number;
}

export class AgingBracketDto {
    @ApiProperty({
        description: 'Aging bracket range (e.g., "0-30", "31-60", "61-90", "90+")',
        example: '0-30',
    })
    range!: string;

    @ApiProperty({
        description: 'Number of invoices in this aging bracket',
        example: 25,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total amount for invoices in this bracket',
        example: 37500.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Average days overdue for this bracket',
        example: 15.5,
    })
    @IsNumber()
    averageDaysOverdue!: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({
        description: 'Invoice status counts',
        type: () => InvoiceStatusCountDto,
        isArray: true,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceStatusCountDto)
    statusCounts!: InvoiceStatusCountDto[];

    @ApiProperty({
        description: 'Aging analysis for unpaid/overdue invoices',
        type: () => AgingBracketDto,
        isArray: true,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AgingBracketDto)
    agingAnalysis!: AgingBracketDto[];

    @ApiProperty({
        description: 'Total number of invoices analyzed',
        example: 124,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total value of all invoices',
        example: 186000.25,
    })
    @IsNumber()
    totalValue!: number;
}