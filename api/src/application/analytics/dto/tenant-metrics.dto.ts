import { ApiProperty } from '@nestjs/swagger';

export class TenantMetricDto {
    @ApiProperty({ description: 'Tenant ID' })
    tenantId: string;

    @ApiProperty({ description: 'Tenant name' })
    tenantName: string;

    @ApiProperty({ description: 'Total number of invoices' })
    totalInvoices: number;

    @ApiProperty({ description: 'Total revenue from this tenant' })
    totalRevenue: number;

    @ApiProperty({ description: 'Average invoice value' })
    averageInvoiceValue: number;

    @ApiProperty({ description: 'Number of paid invoices' })
    paidInvoices: number;

    @ApiProperty({ description: 'Number of unpaid invoices' })
    unpaidInvoices: number;

    @ApiProperty({ description: 'Number of overdue invoices' })
    overdueInvoices: number;

    @ApiProperty({ description: 'Average days to payment' })
    averageDaysToPayment?: number;

    @ApiProperty({ description: 'Payment timeliness percentage (0-100)' })
    paymentTimelinessPercentage: number;
}

export class TenantMetricsDto {
    @ApiProperty({ 
        description: 'List of tenant metrics',
        type: [TenantMetricDto]
    })
    tenantMetrics: TenantMetricDto[];

    @ApiProperty({ description: 'Total number of tenants' })
    totalTenants: number;

    @ApiProperty({ description: 'Number of active tenants (with invoices)' })
    activeTenants: number;

    @ApiProperty({ description: 'Top performing tenant by revenue' })
    topTenantByRevenue?: TenantMetricDto;

    @ApiProperty({ description: 'Top performing tenant by invoice count' })
    topTenantByInvoiceCount?: TenantMetricDto;
}

export class TopCustomerDto {
    @ApiProperty({ description: 'Customer name' })
    customerName: string;

    @ApiProperty({ description: 'Total revenue from this customer' })
    totalRevenue: number;

    @ApiProperty({ description: 'Number of invoices' })
    invoiceCount: number;

    @ApiProperty({ description: 'Average invoice value' })
    averageInvoiceValue: number;

    @ApiProperty({ description: 'Percentage of total revenue' })
    revenuePercentage: number;
}