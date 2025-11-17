import { AnalyticsResponseDto } from '../dto/analytics-response.dto';
import { RevenueMetricsDto } from '../dto/revenue-trend.dto';
import { TopTenantsDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

export const ANALYTICS_SERVICE = Symbol('ANALYTICS_SERVICE');

export interface IAnalyticsService {
    getAnalyticsOverview(
        tenantId: string | null,
        query: AnalyticsQueryDto,
    ): Promise<AnalyticsResponseDto>;

    getRevenueMetrics(
        tenantId: string | null,
        query: AnalyticsQueryDto,
    ): Promise<RevenueMetricsDto>;

    getTenantMetrics(
        tenantId: string | null,
        query: AnalyticsQueryDto,
    ): Promise<TopTenantsDto>;

    getInvoiceStatusMetrics(
        tenantId: string | null,
        query: AnalyticsQueryDto,
    ): Promise<InvoiceStatusDto>;

    getPaymentDistribution(
        tenantId: string | null,
        query: AnalyticsQueryDto,
    ): Promise<PaymentDistributionDto>;
}