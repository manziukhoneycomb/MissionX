import { ApiProperty } from '@nestjs/swagger';
import { RevenueTrendDto } from './revenue-trend.dto';
import { TenantMetricsDto } from './tenant-metrics.dto';
import { InvoiceStatusDto } from './invoice-status.dto';
import { PaymentDistributionDto } from './payment-distribution.dto';

export class AnalyticsResponseDto {
    @ApiProperty({
        description: 'Revenue trend data by time period',
        type: RevenueTrendDto,
    })
    revenueTrend!: RevenueTrendDto;

    @ApiProperty({
        description: 'Tenant performance metrics',
        type: TenantMetricsDto,
    })
    tenantMetrics!: TenantMetricsDto;

    @ApiProperty({
        description: 'Invoice status overview',
        type: InvoiceStatusDto,
    })
    invoiceStatus!: InvoiceStatusDto;

    @ApiProperty({
        description: 'Payment distribution analytics',
        type: PaymentDistributionDto,
    })
    paymentDistribution!: PaymentDistributionDto;

    @ApiProperty({
        description: 'Date range for the analytics data',
        example: { startDate: '2023-01-01', endDate: '2023-12-31' },
    })
    dateRange!: {
        startDate: string;
        endDate: string;
    };

    @ApiProperty({
        description: 'Total number of invoices in the dataset',
        example: 1250,
    })
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total revenue amount for the date range',
        example: 125000.50,
    })
    totalRevenue!: number;
}