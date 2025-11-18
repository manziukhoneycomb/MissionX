import { ApiProperty } from '@nestjs/swagger';

export class TenantPerformanceDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: 'tenant-123',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Tech Solutions Inc',
    })
    tenantName: string;

    @ApiProperty({
        description: 'Total number of invoices',
        example: 45,
    })
    invoiceCount: number;

    @ApiProperty({
        description: 'Total revenue from tenant',
        example: 125000.75,
    })
    totalRevenue: number;

    @ApiProperty({
        description: 'Average invoice value',
        example: 2777.78,
    })
    averageInvoiceValue: number;

    @ApiProperty({
        description: 'Average days to payment',
        example: 15.5,
    })
    averagePaymentDays: number;

    @ApiProperty({
        description: 'Payment timeliness percentage (paid on time)',
        example: 85.5,
    })
    paymentTimelinessPercentage: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 3,
    })
    overdueInvoices: number;
}

export class InvoiceVolumeDataDto {
    @ApiProperty({
        description: 'Date for the data point',
        example: '2024-01-15',
    })
    date: string;

    @ApiProperty({
        description: 'Number of invoices created',
        example: 8,
    })
    invoiceCount: number;
}

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Tenant performance metrics',
        type: [TenantPerformanceDto],
    })
    tenantPerformance: TenantPerformanceDto[];

    @ApiProperty({
        description: 'Invoice volume over time',
        type: [InvoiceVolumeDataDto],
    })
    invoiceVolumeData: InvoiceVolumeDataDto[];

    @ApiProperty({
        description: 'Total number of active tenants',
        example: 12,
    })
    totalActiveTenants: number;

    @ApiProperty({
        description: 'Average invoices per tenant',
        example: 37.5,
    })
    averageInvoicesPerTenant: number;

    @ApiProperty({
        description: 'Most active tenant name',
        example: 'Tech Solutions Inc',
    })
    mostActiveTenant: string;

    @ApiProperty({
        description: 'Highest revenue tenant name',
        example: 'Enterprise Corp',
    })
    highestRevenueTenant: string;
}