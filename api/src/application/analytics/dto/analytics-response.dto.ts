import { ApiProperty } from '@nestjs/swagger';
import { RevenueTrendDto } from './revenue-trend.dto';
import { TenantMetricsDto } from './tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from './invoice-status.dto';
import { PaymentDistributionDto } from './payment-distribution.dto';

export class AnalyticsResponseDto {
    @ApiProperty({
        description: 'Revenue trend data over time',
        type: () => RevenueTrendDto,
        isArray: true,
    })
    revenueTrends!: RevenueTrendDto[];

    @ApiProperty({
        description: 'Tenant performance metrics',
        type: () => TenantMetricsDto,
        isArray: true,
    })
    tenantMetrics!: TenantMetricsDto[];

    @ApiProperty({
        description: 'Invoice status overview',
        type: () => InvoiceStatusOverviewDto,
    })
    invoiceStatusOverview!: InvoiceStatusOverviewDto;

    @ApiProperty({
        description: 'Payment distribution analytics',
        type: () => PaymentDistributionDto,
        isArray: true,
    })
    paymentDistribution!: PaymentDistributionDto[];

    @ApiProperty({
        description: 'Date range for the analytics data',
        example: { startDate: '2024-01-01', endDate: '2024-12-31' },
    })
    dateRange!: {
        startDate: string;
        endDate: string;
    };

    @ApiProperty({
        description: 'Total number of invoices in the dataset',
        example: 150,
    })
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total revenue amount',
        example: 125000.50,
    })
    totalRevenue!: number;
}