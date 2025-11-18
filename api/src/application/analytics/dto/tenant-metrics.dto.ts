import { ApiProperty } from '@nestjs/swagger';

export class TenantPerformanceDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corporation',
    })
    tenantName!: string;

    @ApiProperty({
        description: 'Total number of invoices for this tenant',
        example: 125,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total revenue from this tenant',
        example: 25000.75,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value for this tenant',
        example: 200.01,
    })
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Payment timeliness score (0-100)',
        example: 85.5,
    })
    paymentTimelinessScore!: number;

    @ApiProperty({
        description: 'Percentage of total revenue this tenant represents',
        example: 12.5,
    })
    revenuePercentage!: number;
}

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Top performing tenants',
        type: [TenantPerformanceDto],
    })
    topTenants!: TenantPerformanceDto[];

    @ApiProperty({
        description: 'Total number of active tenants',
        example: 45,
    })
    totalActiveTenants!: number;

    @ApiProperty({
        description: 'Average invoices per tenant',
        example: 27.8,
    })
    averageInvoicesPerTenant!: number;

    @ApiProperty({
        description: 'Average revenue per tenant',
        example: 2777.78,
    })
    averageRevenuePerTenant!: number;

    @ApiProperty({
        description: 'Overall payment timeliness score across all tenants',
        example: 78.9,
    })
    overallPaymentTimeliness!: number;
}