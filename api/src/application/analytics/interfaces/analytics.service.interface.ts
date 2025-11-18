import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { RevenueTrendDto } from '../dto/revenue-trend.dto';
import { TenantMetricsDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusDto } from '../dto/invoice-status.dto';
import { ComprehensiveAnalyticsDto } from '../dto/analytics-response.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    /**
     * Get comprehensive analytics data including all metrics
     */
    getComprehensiveAnalytics(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<ComprehensiveAnalyticsDto>;

    /**
     * Get revenue trend analysis
     */
    getRevenueTrend(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<RevenueTrendDto>;

    /**
     * Get tenant performance metrics
     */
    getTenantMetrics(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<TenantMetricsDto>;

    /**
     * Get invoice status overview
     */
    getInvoiceStatus(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<InvoiceStatusDto>;
}