import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Date period (YYYY-MM-DD or YYYY-MM)',
        example: '2023-01',
    })
    period!: string;

    @ApiProperty({
        description: 'Total revenue for the period',
        example: 15000.50,
    })
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices in the period',
        example: 25,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice value for the period',
        example: 600.02,
    })
    averageValue!: number;
}

export class MonthlyRevenueDto {
    @ApiProperty({
        description: 'Month in YYYY-MM format',
        example: '2023-01',
    })
    month!: string;

    @ApiProperty({
        description: 'Total revenue for the month',
        example: 15000.50,
    })
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices in the month',
        example: 25,
    })
    invoiceCount!: number;
}

export class QuarterlyRevenueDto {
    @ApiProperty({
        description: 'Quarter and year (e.g., Q1 2023)',
        example: 'Q1 2023',
    })
    quarter!: string;

    @ApiProperty({
        description: 'Total revenue for the quarter',
        example: 45000.75,
    })
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices in the quarter',
        example: 75,
    })
    invoiceCount!: number;
}