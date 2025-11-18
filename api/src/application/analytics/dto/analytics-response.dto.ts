import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RevenueTrendDto } from './revenue-trend.dto';
import { TenantMetricsDto } from './tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from './invoice-status.dto';
import { PaymentDistributionDto } from './payment-distribution.dto';

export class TopCustomerDto {
    @ApiProperty({
        description: 'Customer name',
        example: 'ABC Corporation',
    })
    @IsString()
    customerName!: string;

    @ApiProperty({
        description: 'Total revenue from this customer',
        example: 125000.50,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Number of invoices from this customer',
        example: 45,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice value',
        example: 2777.78,
    })
    @IsNumber()
    averageInvoiceValue!: number;
}

export class AnalyticsSummaryDto {
    @ApiProperty({
        description: 'Total revenue for the period',
        example: 1250000.75,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Total number of invoices',
        example: 500,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Average invoice value',
        example: 2500.00,
    })
    @IsNumber()
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Revenue growth percentage compared to previous period',
        example: 15.5,
    })
    @IsNumber()
    revenueGrowth!: number;

    @ApiProperty({
        description: 'Invoice count growth percentage compared to previous period',
        example: 8.2,
    })
    @IsNumber()
    invoiceGrowth!: number;

    @ApiProperty({
        description: 'Collection efficiency percentage',
        example: 92.5,
    })
    @IsNumber()
    collectionEfficiency!: number;

    @ApiProperty({
        description: 'Average days to payment',
        example: 28.5,
    })
    @IsNumber()
    averageDaysToPayment!: number;
}

export class ComprehensiveAnalyticsDto {
    @ApiProperty({
        description: 'Analytics summary',
        type: AnalyticsSummaryDto,
    })
    @ValidateNested()
    @Type(() => AnalyticsSummaryDto)
    summary!: AnalyticsSummaryDto;

    @ApiProperty({
        description: 'Revenue trends over time',
        type: [RevenueTrendDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RevenueTrendDto)
    revenueTrends!: RevenueTrendDto[];

    @ApiProperty({
        description: 'Top customers by revenue',
        type: [TopCustomerDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TopCustomerDto)
    topCustomers!: TopCustomerDto[];

    @ApiProperty({
        description: 'Tenant performance metrics',
        type: [TenantMetricsDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TenantMetricsDto)
    tenantMetrics!: TenantMetricsDto[];

    @ApiProperty({
        description: 'Invoice status overview',
        type: InvoiceStatusOverviewDto,
    })
    @ValidateNested()
    @Type(() => InvoiceStatusOverviewDto)
    invoiceStatus!: InvoiceStatusOverviewDto;

    @ApiProperty({
        description: 'Payment distribution analysis',
        type: PaymentDistributionDto,
    })
    @ValidateNested()
    @Type(() => PaymentDistributionDto)
    paymentDistribution!: PaymentDistributionDto;
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics query (YYYY-MM-DD)',
        example: '2024-01-01',
        required: false,
    })
    @IsString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics query (YYYY-MM-DD)',
        example: '2024-12-31',
        required: false,
    })
    @IsString()
    endDate?: string;

    @ApiProperty({
        description: 'Tenant ID to filter analytics (Super Admin can see all tenants)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsString()
    tenantId?: string;

    @ApiProperty({
        description: 'Include revenue trends in response',
        example: true,
        required: false,
    })
    includeRevenueTrends?: boolean;

    @ApiProperty({
        description: 'Include top customers in response',
        example: true,
        required: false,
    })
    includeTopCustomers?: boolean;

    @ApiProperty({
        description: 'Include tenant metrics in response',
        example: true,
        required: false,
    })
    includeTenantMetrics?: boolean;

    @ApiProperty({
        description: 'Include invoice status overview in response',
        example: true,
        required: false,
    })
    includeInvoiceStatus?: boolean;

    @ApiProperty({
        description: 'Include payment distribution in response',
        example: true,
        required: false,
    })
    includePaymentDistribution?: boolean;
}