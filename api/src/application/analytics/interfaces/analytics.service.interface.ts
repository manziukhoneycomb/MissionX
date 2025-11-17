import { 
    RevenueTrendResponseDto, 
    TopCustomerDto 
} from '../dto/revenue-trend.dto';
import { TenantMetricsResponseDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusResponseDto } from '../dto/invoice-status.dto';
import { PaymentDistributionResponseDto } from '../dto/payment-distribution.dto';
import { DateRangeDto, AnalyticsQueryDto } from '../dto/analytics-response.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    getRevenueTrends(
        tenantId: string | null,
        dateRange: DateRangeDto,
        groupBy?: 'month' | 'quarter' | 'year'
    ): Promise<RevenueTrendResponseDto>;

    getTopCustomers(
        tenantId: string | null,
        dateRange: DateRangeDto,
        limit?: number
    ): Promise<TopCustomerDto[]>;

    getTenantMetrics(
        tenantId: string | null,
        query: AnalyticsQueryDto
    ): Promise<TenantMetricsResponseDto>;

    getInvoiceStatusOverview(
        tenantId: string | null,
        dateRange: DateRangeDto
    ): Promise<InvoiceStatusResponseDto>;

    getPaymentDistribution(
        tenantId: string | null,
        dateRange: DateRangeDto
    ): Promise<PaymentDistributionResponseDto>;
}