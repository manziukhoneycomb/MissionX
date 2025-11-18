import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corporation',
    })
    @IsString()
    tenantName!: string;

    @ApiProperty({
        description: 'Total number of invoices for the tenant',
        example: 150,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Average invoice value for the tenant',
        example: 2500.75,
    })
    @IsNumber()
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Total revenue from the tenant',
        example: 375112.50,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 120,
    })
    @IsNumber()
    paidInvoices!: number;

    @ApiProperty({
        description: 'Number of unpaid invoices',
        example: 25,
    })
    @IsNumber()
    unpaidInvoices!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 5,
    })
    @IsNumber()
    overdueInvoices!: number;

    @ApiProperty({
        description: 'Payment timeliness score (0-100)',
        example: 85.5,
    })
    @IsNumber()
    paymentTimeliness!: number;
}

export class TenantMetricsQueryDto {
    @ApiProperty({
        description: 'Start date for metrics calculation',
        example: '2024-01-01',
        required: false,
    })
    @IsString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for metrics calculation',
        example: '2024-12-31',
        required: false,
    })
    @IsString()
    endDate?: string;

    @ApiProperty({
        description: 'Number of top tenants to return',
        example: 10,
        required: false,
    })
    @IsNumber()
    limit?: number;

    @ApiProperty({
        description: 'Sort by: revenue, invoiceCount, paymentTimeliness',
        example: 'revenue',
        enum: ['revenue', 'invoiceCount', 'paymentTimeliness'],
        required: false,
    })
    @IsString()
    sortBy?: 'revenue' | 'invoiceCount' | 'paymentTimeliness';
}