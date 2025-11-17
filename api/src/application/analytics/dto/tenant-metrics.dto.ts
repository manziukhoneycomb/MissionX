import { ApiProperty } from '@nestjs/swagger';

export class TenantMetricDto {
    @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
    tenantId!: string;

    @ApiProperty({ description: 'Tenant name', example: 'Acme Corporation', required: false })
    tenantName?: string;

    @ApiProperty({ description: 'Total number of invoices', example: 45 })
    invoiceCount!: number;

    @ApiProperty({ description: 'Total revenue', example: 25000.50 })
    totalRevenue!: number;

    @ApiProperty({ description: 'Average invoice value', example: 555.56 })
    averageInvoiceValue!: number;

    @ApiProperty({ description: 'Number of paid invoices', example: 40 })
    paidInvoices!: number;

    @ApiProperty({ description: 'Number of unpaid invoices', example: 3 })
    unpaidInvoices!: number;

    @ApiProperty({ description: 'Number of overdue invoices', example: 2 })
    overdueInvoices!: number;

    @ApiProperty({ description: 'Payment success rate as percentage', example: 88.89 })
    paymentSuccessRate!: number;

    @ApiProperty({ description: 'Average days to payment', example: 12.5, required: false })
    averageDaysToPayment?: number;
}

export class TenantPerformanceDto {
    @ApiProperty({ description: 'Tenant performance metrics', type: [TenantMetricDto] })
    tenants!: TenantMetricDto[];

    @ApiProperty({ description: 'Total invoices across all tenants', example: 234 })
    totalInvoices!: number;

    @ApiProperty({ description: 'Total revenue across all tenants', example: 125000.50 })
    totalRevenue!: number;

    @ApiProperty({ description: 'Average invoices per tenant', example: 23.4 })
    averageInvoicesPerTenant!: number;

    @ApiProperty({ description: 'Top performing tenant by revenue', type: TenantMetricDto })
    topTenant!: TenantMetricDto;
}