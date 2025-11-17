import {
    AnalyticsQueryDto,
    AnalyticsResponseDto,
    RevenueMetricDto,
    TenantPerformanceDto,
    InvoiceStatusOverviewDto,
    PaymentDistributionDto,
} from '../dto/analytics.dto';

export interface IAnalyticsService {
    getAnalytics(query: AnalyticsQueryDto): Promise<AnalyticsResponseDto>;
    getRevenueMetrics(query: AnalyticsQueryDto): Promise<RevenueMetricDto[]>;
    getTenantPerformance(query: AnalyticsQueryDto): Promise<TenantPerformanceDto[]>;
    getInvoiceStatusOverview(query: AnalyticsQueryDto): Promise<InvoiceStatusOverviewDto>;
    getPaymentDistribution(query: AnalyticsQueryDto): Promise<PaymentDistributionDto[]>;
}