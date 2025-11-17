import {
    AnalyticsDashboardDto,
    AnalyticsQueryDto,
} from '../dto/analytics-response.dto';
import { RevenueTrendDto } from '../dto/revenue-trend.dto';
import { TenantMetricsDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    getRevenueTrend(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<RevenueTrendDto>;

    getTenantMetrics(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<TenantMetricsDto>;

    getInvoiceStatusOverview(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<InvoiceStatusOverviewDto>;

    getPaymentDistribution(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<PaymentDistributionDto>;

    getDashboardAnalytics(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<AnalyticsDashboardDto>;
}