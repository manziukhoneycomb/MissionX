import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RevenueTrendDto } from './revenue-trend.dto';
import { TenantMetricsDto } from './tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from './invoice-status.dto';
import { PaymentDistributionDto } from './payment-distribution.dto';

export enum AnalyticsPeriodType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly',
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics query (ISO 8601 format)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics query (ISO 8601 format)',
        example: '2024-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Period type for grouping data',
        enum: AnalyticsPeriodType,
        default: AnalyticsPeriodType.MONTHLY,
        required: false,
    })
    @IsOptional()
    @IsEnum(AnalyticsPeriodType)
    periodType?: AnalyticsPeriodType = AnalyticsPeriodType.MONTHLY;

    @ApiProperty({
        description: 'Specific tenant ID to filter analytics (Super Admin only)',
        required: false,
    })
    @IsOptional()
    @IsString()
    tenantId?: string;
}

export class AnalyticsDashboardDto {
    @ApiProperty({
        description: 'Revenue trend analytics',
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
        type: InvoiceStatusOverviewDto,
    })
    invoiceStatus!: InvoiceStatusOverviewDto;

    @ApiProperty({
        description: 'Payment distribution analysis',
        type: PaymentDistributionDto,
    })
    paymentDistribution!: PaymentDistributionDto;

    @ApiProperty({
        description: 'Generated timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    generatedAt!: string;

    @ApiProperty({
        description: 'Query parameters used for this analytics',
        type: AnalyticsQueryDto,
    })
    queryParams!: AnalyticsQueryDto;
}