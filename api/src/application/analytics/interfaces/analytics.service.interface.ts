import { AnalyticsQueryDto } from '../dto/analytics-response.dto';
import { RevenueTrendDto, TopCustomerDto } from '../dto/revenue-trend.dto';
import { TenantPerformanceDto } from '../dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../dto/invoice-status.dto';
import { PaymentDistributionDto } from '../dto/payment-distribution.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    getRevenueTrends(query: AnalyticsQueryDto, tenantId?: string): Promise<RevenueTrendDto>;
    
    getTopCustomers(
        query: AnalyticsQueryDto, 
        tenantId?: string, 
        limit?: number
    ): Promise<TopCustomerDto[]>;
    
    getTenantPerformance(query: AnalyticsQueryDto, tenantId?: string): Promise<TenantPerformanceDto>;
    
    getInvoiceStatusOverview(
        query: AnalyticsQueryDto, 
        tenantId?: string
    ): Promise<InvoiceStatusOverviewDto>;
    
    getPaymentDistribution(
        query: AnalyticsQueryDto, 
        tenantId?: string
    ): Promise<PaymentDistributionDto>;
}