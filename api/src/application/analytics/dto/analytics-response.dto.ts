import { ApiProperty } from '@nestjs/swagger';
import { RevenueTrendDto } from './revenue-trend.dto';
import { TenantMetricsDto } from './tenant-metrics.dto';
import { InvoiceStatusDto } from './invoice-status.dto';

export class AnalyticsSummaryDto {
    @ApiProperty({
        description: 'Total revenue across all invoices',
        example: 250000.75,
    })
    totalRevenue: number;

    @ApiProperty({
        description: 'Total number of invoices',
        example: 150,
    })
    totalInvoices: number;

    @ApiProperty({
        description: 'Total number of customers',
        example: 45,
    })
    totalCustomers: number;

    @ApiProperty({
        description: 'Total number of active tenants',
        example: 8,
    })
    totalTenants: number;

    @ApiProperty({
        description: 'Average invoice value',
        example: 1666.67,
    })
    averageInvoiceValue: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 120,
    })
    paidInvoices: number;

    @ApiProperty({
        description: 'Number of unpaid invoices',
        example: 25,
    })
    unpaidInvoices: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 5,
    })
    overdueInvoices: number;

    @ApiProperty({
        description: 'Revenue growth percentage from previous period',
        example: 15.5,
    })
    revenueGrowth: number;
}

export class ComprehensiveAnalyticsDto {
    @ApiProperty({
        description: 'Analytics summary metrics',
        type: AnalyticsSummaryDto,
    })
    summary: AnalyticsSummaryDto;

    @ApiProperty({
        description: 'Revenue trend analysis',
        type: RevenueTrendDto,
    })
    revenueTrend: RevenueTrendDto;

    @ApiProperty({
        description: 'Tenant performance metrics',
        type: TenantMetricsDto,
    })
    tenantMetrics: TenantMetricsDto;

    @ApiProperty({
        description: 'Invoice status overview',
        type: InvoiceStatusDto,
    })
    invoiceStatus: InvoiceStatusDto;

    @ApiProperty({
        description: 'Date range for the analytics data',
        example: { startDate: '2024-01-01', endDate: '2024-01-31' },
    })
    dateRange: {
        startDate: string;
        endDate: string;
    };

    @ApiProperty({
        description: 'Timestamp when analytics were generated',
        example: '2024-01-31T23:59:59.999Z',
    })
    generatedAt: string;
}