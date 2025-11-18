import { RevenueAnalyticsDto } from '../dto/revenue-trend.dto';
import { TenantMetricsDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';
import { ComprehensiveAnalyticsDto } from '../dto/analytics-response.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

export const ANALYTICS_SERVICE = Symbol('ANALYTICS_SERVICE');

export interface IAnalyticsService {
    /**
     * Get comprehensive analytics data including all metrics
     */
    getComprehensiveAnalytics(
        tenantId: string,
        query: AnalyticsQueryDto,
    ): Promise<ComprehensiveAnalyticsDto>;

    /**
     * Get revenue analytics and trends
     */
    getRevenueAnalytics(tenantId: string, query: AnalyticsQueryDto): Promise<RevenueAnalyticsDto>;

    /**
     * Get tenant performance metrics
     */
    getTenantMetrics(tenantId: string, query: AnalyticsQueryDto): Promise<TenantMetricsDto>;

    /**
     * Get invoice status overview and aging analysis
     */
    getInvoiceStatusOverview(
        tenantId: string,
        query: AnalyticsQueryDto,
    ): Promise<InvoiceStatusOverviewDto>;

    /**
     * Get payment distribution analytics
     */
    getPaymentDistribution(
        tenantId: string,
        query: AnalyticsQueryDto,
    ): Promise<PaymentDistributionDto>;
}