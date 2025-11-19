import { AnalyticsQueryDto, AnalyticsResponseDto } from '../dto/analytics-response.dto';
import { RevenueTrendDto, MonthlyRevenueDto, QuarterlyRevenueDto } from '../dto/revenue-trend.dto';
import { TenantMetricsDto, TopCustomerDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusDto, InvoiceAgingDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    getComprehensiveAnalytics(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<AnalyticsResponseDto>;

    getRevenueTrends(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<RevenueTrendDto[]>;

    getMonthlyRevenue(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<MonthlyRevenueDto[]>;

    getQuarterlyRevenue(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<QuarterlyRevenueDto[]>;

    getTenantMetrics(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<TenantMetricsDto[]>;

    getTopCustomers(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
        limit?: number,
    ): Promise<TopCustomerDto[]>;

    getInvoiceStatus(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<InvoiceStatusDto>;

    getInvoiceAging(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<InvoiceAgingDto[]>;

    getPaymentDistribution(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<PaymentDistributionDto>;
}