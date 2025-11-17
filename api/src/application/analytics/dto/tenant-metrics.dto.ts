import { ApiProperty } from '@nestjs/swagger';

export class TenantMetricsDataPointDto {
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
        example: 45,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total revenue from this tenant',
        example: 25000.75,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value for this tenant',
        example: 555.57,
    })
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 40,
    })
    paidInvoices!: number;

    @ApiProperty({
        description: 'Number of unpaid invoices',
        example: 3,
    })
    unpaidInvoices!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 2,
    })
    overdueInvoices!: number;

    @ApiProperty({
        description: 'Payment timeliness percentage (0-100)',
        example: 88.9,
    })
    paymentTimeliness!: number;

    @ApiProperty({
        description: 'Average days to payment',
        example: 15.5,
    })
    averageDaysToPayment!: number;
}

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Array of tenant performance metrics',
        type: [TenantMetricsDataPointDto],
    })
    tenantMetrics!: TenantMetricsDataPointDto[];

    @ApiProperty({
        description: 'Total number of active tenants',
        example: 25,
    })
    totalTenants!: number;

    @ApiProperty({
        description: 'Top performing tenant by revenue',
        type: TenantMetricsDataPointDto,
    })
    topTenant!: TenantMetricsDataPointDto;

    @ApiProperty({
        description: 'Average invoices per tenant',
        example: 18.5,
    })
    averageInvoicesPerTenant!: number;
}