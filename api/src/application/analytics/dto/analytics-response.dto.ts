import { ApiProperty } from '@nestjs/swagger';
import { RevenueTrendDto } from './revenue-trend.dto';
import { TenantMetricsDto } from './tenant-metrics.dto';
import { InvoiceStatusDto } from './invoice-status.dto';
import { PaymentDistributionDto } from './payment-distribution.dto';

export class AnalyticsResponseDto {
    @ApiProperty({
        description: 'Revenue trends over time',
        type: [RevenueTrendDto],
    })
    revenueTrends!: RevenueTrendDto[];

    @ApiProperty({
        description: 'Tenant performance metrics',
        type: [TenantMetricsDto],
    })
    tenantMetrics!: TenantMetricsDto[];

    @ApiProperty({
        description: 'Invoice status overview',
        type: InvoiceStatusDto,
    })
    invoiceStatus!: InvoiceStatusDto;

    @ApiProperty({
        description: 'Payment distribution data',
        type: PaymentDistributionDto,
    })
    paymentDistribution!: PaymentDistributionDto;

    @ApiProperty({
        description: 'Date range for the analytics data',
        example: { startDate: '2024-01-01', endDate: '2024-12-31' },
    })
    dateRange!: {
        startDate: string;
        endDate: string;
    };
}