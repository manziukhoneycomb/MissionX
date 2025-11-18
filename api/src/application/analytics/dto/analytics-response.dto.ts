import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
    @ApiProperty({ 
        description: 'Start date for the analytics period',
        example: '2024-01-01',
        required: false
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ 
        description: 'End date for the analytics period',
        example: '2024-12-31',
        required: false
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ 
        description: 'Tenant ID to filter data for specific tenant',
        required: false
    })
    @IsOptional()
    tenantId?: string;

    @ApiProperty({ 
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({ 
        description: 'Page number',
        minimum: 1,
        default: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;
}

export class AnalyticsMetaSummaryDto {
    @ApiProperty({ description: 'Total number of invoices' })
    totalInvoices: number;

    @ApiProperty({ description: 'Total revenue amount' })
    totalRevenue: number;

    @ApiProperty({ description: 'Number of active tenants' })
    activeTenants: number;

    @ApiProperty({ description: 'Average invoice value' })
    averageInvoiceValue: number;
}