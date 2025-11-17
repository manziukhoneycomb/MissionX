import { ApiProperty } from '@nestjs/swagger';

export class TenantPerformanceDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: 'tenant-123-uuid',
    })
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corporation',
    })
    tenantName!: string;

    @ApiProperty({
        description: 'Total number of invoices',
        example: 45,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total revenue from this tenant',
        example: 25750.00,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value',
        example: 572.22,
    })
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Percentage of invoices paid on time',
        example: 87.5,
    })
    onTimePaymentRate!: number;

    @ApiProperty({
        description: 'Average days to payment',
        example: 18.5,
    })
    averagePaymentDays!: number;
}

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Array of tenant performance metrics',
        type: [TenantPerformanceDto],
    })
    tenants!: TenantPerformanceDto[];

    @ApiProperty({
        description: 'Total number of tenants',
        example: 12,
    })
    totalTenants!: number;

    @ApiProperty({
        description: 'Top performing tenant by revenue',
        type: TenantPerformanceDto,
    })
    topTenant!: TenantPerformanceDto;

    @ApiProperty({
        description: 'Average invoice value across all tenants',
        example: 625.50,
    })
    averageInvoiceValue!: number;
}