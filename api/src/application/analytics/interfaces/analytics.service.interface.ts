import { AnalyticsResponseDto } from '../dto/analytics-response.dto';
import { RevenueTrendDto, TopCustomerDto } from '../dto/revenue-trend.dto';
import { TenantMetricsDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

export interface IAnalyticsService {
    getAnalyticsOverview(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<AnalyticsResponseDto>;

    getRevenueTrends(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<RevenueTrendDto[]>;

    getTenantMetrics(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TenantMetricsDto[]>;

    getInvoiceStatusOverview(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<InvoiceStatusOverviewDto>;

    getPaymentDistribution(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<PaymentDistributionDto[]>;

    getTopCustomers(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TopCustomerDto[]>;
}

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';