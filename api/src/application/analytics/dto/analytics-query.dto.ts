import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum AnalyticsPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly',
}

export enum MetricType {
    REVENUE = 'revenue',
    TENANT_METRICS = 'tenant_metrics',
    INVOICE_STATUS = 'invoice_status',
    PAYMENT_DISTRIBUTION = 'payment_distribution',
    ALL = 'all',
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics period (ISO date string)',
        example: '2023-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics period (ISO date string)',
        example: '2023-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Time period for trend analysis',
        enum: AnalyticsPeriod,
        example: AnalyticsPeriod.MONTHLY,
        required: false,
    })
    @IsOptional()
    @IsEnum(AnalyticsPeriod)
    period?: AnalyticsPeriod;

    @ApiProperty({
        description: 'Specific metric type to retrieve',
        enum: MetricType,
        example: MetricType.ALL,
        required: false,
    })
    @IsOptional()
    @IsEnum(MetricType)
    metricType?: MetricType;

    @ApiProperty({
        description: 'Limit for top results (e.g., top N tenants)',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        description: 'Filter by specific tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    tenantId?: string;
}