import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class DateRangeDto {
    @ApiProperty({ required: false, description: 'Start date (YYYY-MM-DD)' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiProperty({ required: false, description: 'End date (YYYY-MM-DD)' })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiProperty({ required: false, enum: ['day', 'week', 'month', 'quarter'], description: 'Group by time period' })
    @IsOptional()
    @IsEnum(['day', 'week', 'month', 'quarter'])
    groupBy?: 'day' | 'week' | 'month' | 'quarter';
}

export class MetricSummaryDto {
    @ApiProperty({ description: 'Current period value' })
    current: number;

    @ApiProperty({ description: 'Previous period value' })
    previous: number;

    @ApiProperty({ description: 'Percentage change from previous period' })
    changePercent: number;

    @ApiProperty({ description: 'Change type indicator' })
    changeType: 'increase' | 'decrease' | 'no-change';
}

export class AnalyticsOverviewDto {
    @ApiProperty({ description: 'Total revenue summary' })
    totalRevenue: MetricSummaryDto;

    @ApiProperty({ description: 'Total invoices summary' })
    totalInvoices: MetricSummaryDto;

    @ApiProperty({ description: 'Average invoice value summary' })
    avgInvoiceValue: MetricSummaryDto;

    @ApiProperty({ description: 'Payment success rate summary' })
    paymentSuccessRate: MetricSummaryDto;
}

export class TimeSeriesDataPointDto {
    @ApiProperty({ description: 'Date label' })
    date: string;

    @ApiProperty({ description: 'Value for the data point' })
    value: number;

    @ApiProperty({ description: 'Additional metadata', required: false })
    metadata?: Record<string, any>;
}

export class RevenueMetricsDto {
    @ApiProperty({ description: 'Revenue trends over time', type: [TimeSeriesDataPointDto] })
    trends: TimeSeriesDataPointDto[];

    @ApiProperty({ description: 'Top customers by revenue' })
    topCustomers: Array<{
        customerName: string;
        revenue: number;
        invoiceCount: number;
    }>;

    @ApiProperty({ description: 'Payment method distribution' })
    paymentDistribution: Array<{
        method: string;
        amount: number;
        percentage: number;
        count: number;
    }>;

    @ApiProperty({ description: 'Monthly/quarterly trends' })
    periodComparison: Array<{
        period: string;
        revenue: number;
        invoiceCount: number;
        avgValue: number;
    }>;
}

export class TenantMetricsDto {
    @ApiProperty({ description: 'Invoices per tenant' })
    invoicesPerTenant: Array<{
        tenantName: string;
        invoiceCount: number;
        totalRevenue: number;
        avgInvoiceValue: number;
    }>;

    @ApiProperty({ description: 'Payment timeliness by tenant' })
    paymentTimeliness: Array<{
        tenantName: string;
        onTimePayments: number;
        latePayments: number;
        avgDaysToPayment: number;
        timelinessRate: number;
    }>;

    @ApiProperty({ description: 'Tenant performance trends', type: [TimeSeriesDataPointDto] })
    performanceTrends: TimeSeriesDataPointDto[];
}

export class InvoiceStatusMetricsDto {
    @ApiProperty({ description: 'Invoice status distribution' })
    statusDistribution: Array<{
        status: 'paid' | 'unpaid' | 'overdue' | 'draft';
        count: number;
        percentage: number;
        totalAmount: number;
    }>;

    @ApiProperty({ description: 'Invoice aging analysis' })
    agingAnalysis: Array<{
        ageRange: string;
        count: number;
        totalAmount: number;
        percentage: number;
    }>;

    @ApiProperty({ description: 'Status trends over time', type: [TimeSeriesDataPointDto] })
    statusTrends: TimeSeriesDataPointDto[];
}

export class PaymentMetricsDto {
    @ApiProperty({ description: 'Payment distribution by method' })
    methodDistribution: Array<{
        method: string;
        count: number;
        amount: number;
        percentage: number;
    }>;

    @ApiProperty({ description: 'Payment timeliness metrics' })
    timeliness: {
        onTime: number;
        late: number;
        avgDaysEarly: number;
        avgDaysLate: number;
        timelinessRate: number;
    };

    @ApiProperty({ description: 'Payment trends over time', type: [TimeSeriesDataPointDto] })
    paymentTrends: TimeSeriesDataPointDto[];

    @ApiProperty({ description: 'Collection efficiency metrics' })
    collectionEfficiency: {
        totalOutstanding: number;
        totalCollected: number;
        collectionRate: number;
        avgCollectionTime: number;
    };
}