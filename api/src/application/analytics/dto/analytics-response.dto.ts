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
        description: 'Payment distribution by various categories',
        type: PaymentDistributionDto,
    })
    paymentDistribution!: PaymentDistributionDto;
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics range (YYYY-MM-DD)',
        example: '2023-01-01',
        required: false,
    })
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics range (YYYY-MM-DD)',
        example: '2023-12-31',
        required: false,
    })
    endDate?: string;

    @ApiProperty({
        description: 'Tenant ID to filter by (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    tenantId?: string;
}