import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics query (ISO format)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics query (ISO format)',
        example: '2024-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Tenant ID filter (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    tenantId?: string;
}

export class AnalyticsSummaryDto {
    @ApiProperty({
        description: 'Total number of invoices',
        example: 150,
    })
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total revenue amount',
        example: 125000.50,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value',
        example: 833.34,
    })
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Number of unique tenants',
        example: 25,
    })
    uniqueTenants!: number;

    @ApiProperty({
        description: 'Paid invoices count',
        example: 120,
    })
    paidInvoices!: number;

    @ApiProperty({
        description: 'Unpaid invoices count',
        example: 20,
    })
    unpaidInvoices!: number;

    @ApiProperty({
        description: 'Overdue invoices count',
        example: 10,
    })
    overdueInvoices!: number;
}