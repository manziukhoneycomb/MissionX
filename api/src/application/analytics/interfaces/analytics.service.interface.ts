import { AnalyticsSummaryDto, AnalyticsQueryDto } from '../dto/analytics-response.dto';
import { RevenueTrendDto } from '../dto/revenue-trend.dto';
import { TenantMetricsDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    /**
     * Get analytics summary with key metrics
     * @param query - Analytics query parameters including date range and tenant filter
     * @param userTenantId - Tenant ID for non-super-admin users (for data filtering)
     * @param isSuperAdmin - Whether the requesting user is a super admin
     * @returns Promise<AnalyticsSummaryDto>
     */
    getAnalyticsSummary(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<AnalyticsSummaryDto>;

    /**
     * Get revenue trends over time
     * @param query - Analytics query parameters including date range and tenant filter
     * @param period - Time period for aggregation (daily, weekly, monthly, quarterly)
     * @param userTenantId - Tenant ID for non-super-admin users (for data filtering)
     * @param isSuperAdmin - Whether the requesting user is a super admin
     * @returns Promise<RevenueTrendDto>
     */
    getRevenueTrend(
        query: AnalyticsQueryDto,
        period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<RevenueTrendDto>;

    /**
     * Get tenant performance metrics
     * @param query - Analytics query parameters including date range and tenant filter
     * @param userTenantId - Tenant ID for non-super-admin users (for data filtering)
     * @param isSuperAdmin - Whether the requesting user is a super admin
     * @returns Promise<TenantMetricsDto>
     */
    getTenantMetrics(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TenantMetricsDto>;

    /**
     * Get invoice status overview and aging analysis
     * @param query - Analytics query parameters including date range and tenant filter
     * @param userTenantId - Tenant ID for non-super-admin users (for data filtering)
     * @param isSuperAdmin - Whether the requesting user is a super admin
     * @returns Promise<InvoiceStatusOverviewDto>
     */
    getInvoiceStatusOverview(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<InvoiceStatusOverviewDto>;

    /**
     * Get payment distribution analytics
     * @param query - Analytics query parameters including date range and tenant filter
     * @param userTenantId - Tenant ID for non-super-admin users (for data filtering)
     * @param isSuperAdmin - Whether the requesting user is a super admin
     * @returns Promise<PaymentDistributionDto>
     */
    getPaymentDistribution(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<PaymentDistributionDto>;
}