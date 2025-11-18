import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class TenantPerformanceDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corporation',
        required: false,
    })
    @IsOptional()
    @IsString()
    tenantName?: string;

    @ApiProperty({
        description: 'Total number of invoices for this tenant',
        example: 45,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total revenue from this tenant',
        example: 25000.00,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value for this tenant',
        example: 555.56,
    })
    @IsNumber()
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 40,
    })
    @IsNumber()
    paidInvoices!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 3,
    })
    @IsNumber()
    overdueInvoices!: number;

    @ApiProperty({
        description: 'Payment timeliness percentage (0-100)',
        example: 88.89,
    })
    @IsNumber()
    paymentTimeliness!: number;
}

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Top performing tenants by revenue',
        type: [TenantPerformanceDto],
    })
    topTenants!: TenantPerformanceDto[];

    @ApiProperty({
        description: 'All tenant performance metrics',
        type: [TenantPerformanceDto],
    })
    allTenants!: TenantPerformanceDto[];

    @ApiProperty({
        description: 'Total number of active tenants',
        example: 15,
    })
    @IsNumber()
    totalActiveTenants!: number;

    @ApiProperty({
        description: 'Average invoices per tenant',
        example: 12.3,
    })
    @IsNumber()
    averageInvoicesPerTenant!: number;
}