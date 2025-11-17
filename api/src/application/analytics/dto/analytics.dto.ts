import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DateRangeEnum {
    LAST_30_DAYS = 'last_30_days',
    LAST_90_DAYS = 'last_90_days',
    LAST_6_MONTHS = 'last_6_months',
    LAST_YEAR = 'last_year',
    CUSTOM = 'custom',
}

export class AnalyticsQueryDto {
    @ApiPropertyOptional({ enum: DateRangeEnum, default: DateRangeEnum.LAST_30_DAYS })
    @IsOptional()
    @IsEnum(DateRangeEnum)
    dateRange?: DateRangeEnum = DateRangeEnum.LAST_30_DAYS;

    @ApiPropertyOptional({ description: 'Start date for custom range (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date for custom range (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Filter by tenant ID' })
    @IsOptional()
    tenantId?: string;
}

export class RevenueMetricDto {
    @ApiProperty({ description: 'Period label (month, quarter, etc.)' })
    period!: string;

    @ApiProperty({ description: 'Total revenue for the period' })
    totalRevenue!: number;

    @ApiProperty({ description: 'Number of invoices in the period' })
    invoiceCount!: number;

    @ApiProperty({ description: 'Average invoice value' })
    averageInvoiceValue!: number;
}

export class TenantPerformanceDto {
    @ApiProperty({ description: 'Tenant ID' })
    tenantId!: string;

    @ApiProperty({ description: 'Tenant name' })
    tenantName!: string;

    @ApiProperty({ description: 'Total invoices for tenant' })
    totalInvoices!: number;

    @ApiProperty({ description: 'Total revenue from tenant' })
    totalRevenue!: number;

    @ApiProperty({ description: 'Average invoice value' })
    averageInvoiceValue!: number;

    @ApiProperty({ description: 'Payment timeliness score (0-100)' })
    paymentScore!: number;
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({ description: 'Count of paid invoices' })
    paid!: number;

    @ApiProperty({ description: 'Count of unpaid invoices' })
    unpaid!: number;

    @ApiProperty({ description: 'Count of overdue invoices' })
    overdue!: number;

    @ApiProperty({ description: 'Total invoice count' })
    total!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({ description: 'Payment method or category' })
    category!: string;

    @ApiProperty({ description: 'Number of payments' })
    count!: number;

    @ApiProperty({ description: 'Total amount' })
    amount!: number;

    @ApiProperty({ description: 'Percentage of total' })
    percentage!: number;
}

export class AnalyticsResponseDto {
    @ApiProperty({ description: 'Revenue metrics over time', type: [RevenueMetricDto] })
    revenueMetrics!: RevenueMetricDto[];

    @ApiProperty({ description: 'Tenant performance data', type: [TenantPerformanceDto] })
    tenantPerformance!: TenantPerformanceDto[];

    @ApiProperty({ description: 'Invoice status overview', type: InvoiceStatusOverviewDto })
    invoiceStatusOverview!: InvoiceStatusOverviewDto;

    @ApiProperty({ description: 'Payment distribution data', type: [PaymentDistributionDto] })
    paymentDistribution!: PaymentDistributionDto[];

    @ApiProperty({ description: 'Generated at timestamp' })
    generatedAt!: string;
}