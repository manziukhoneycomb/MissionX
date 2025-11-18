import {
    AnalyticsOverviewDto,
    RevenueMetricsDto,
    TenantMetricsDto,
    InvoiceStatusMetricsDto,
    PaymentMetricsDto,
    DateRangeDto,
} from '../dto/analytics.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    getOverview(tenantId: string): Promise<AnalyticsOverviewDto>;
    getRevenueMetrics(tenantId: string, dateRange: DateRangeDto): Promise<RevenueMetricsDto>;
    getTenantMetrics(tenantId: string, dateRange: DateRangeDto): Promise<TenantMetricsDto>;
    getInvoiceStatusMetrics(tenantId: string): Promise<InvoiceStatusMetricsDto>;
    getPaymentMetrics(tenantId: string, dateRange: DateRangeDto): Promise<PaymentMetricsDto>;
}