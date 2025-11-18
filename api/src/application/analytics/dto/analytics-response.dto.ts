import { ApiProperty } from '@nestjs/swagger';
import { RevenueAnalyticsDto } from './revenue-trend.dto';
import { TenantMetricsDto } from './tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from './invoice-status.dto';
import { PaymentDistributionDto } from './payment-distribution.dto';

export class ComprehensiveAnalyticsDto {
    @ApiProperty({
        description: 'Revenue analytics and trends',
        type: RevenueAnalyticsDto,
    })
    revenueAnalytics!: RevenueAnalyticsDto;

    @ApiProperty({
        description: 'Tenant performance metrics',
        type: TenantMetricsDto,
    })
    tenantMetrics!: TenantMetricsDto;

    @ApiProperty({
        description: 'Invoice status overview and aging analysis',
        type: InvoiceStatusOverviewDto,
    })
    invoiceStatus!: InvoiceStatusOverviewDto;

    @ApiProperty({
        description: 'Payment distribution and customer analytics',
        type: PaymentDistributionDto,
    })
    paymentDistribution!: PaymentDistributionDto;

    @ApiProperty({
        description: 'Timestamp when the analytics were generated',
        example: '2024-01-15T10:30:00Z',
    })
    generatedAt!: string;

    @ApiProperty({
        description: 'Date range used for the analytics',
        example: { startDate: '2024-01-01', endDate: '2024-12-31' },
    })
    dateRange!: {
        startDate: string;
        endDate: string;
    };
}