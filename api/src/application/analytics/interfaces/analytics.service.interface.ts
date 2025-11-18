import { AnalyticsResponseDto } from '../dto/analytics-response.dto';
import { RevenueTrendDto } from '../dto/revenue-trend.dto';
import { TenantMetricsDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

export const ANALYTICS_SERVICE = Symbol('ANALYTICS_SERVICE');

export interface IAnalyticsService {
    getComprehensiveAnalytics(
        query: AnalyticsQueryDto,
        userTenantId?: string
    ): Promise<AnalyticsResponseDto>;

    getRevenueTrend(
        query: AnalyticsQueryDto,
        userTenantId?: string
    ): Promise<RevenueTrendDto>;

    getTenantMetrics(
        query: AnalyticsQueryDto,
        userTenantId?: string
    ): Promise<TenantMetricsDto>;

    getInvoiceStatus(
        query: AnalyticsQueryDto,
        userTenantId?: string
    ): Promise<InvoiceStatusDto>;

    getPaymentDistribution(
        query: AnalyticsQueryDto,
        userTenantId?: string
    ): Promise<PaymentDistributionDto>;
}