import { Injectable, Logger, BadRequestException, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { RevenueTrendDto, RevenueTrendQueryDto } from './dto/revenue-trend.dto';
import { TenantMetricsDto, TenantMetricsQueryDto } from './dto/tenant-metrics.dto';
import { 
    InvoiceStatusOverviewDto, 
    InvoiceStatusDto, 
    InvoiceAgingDto,
    InvoiceStatusQueryDto 
} from './dto/invoice-status.dto';
import { 
    PaymentDistributionDto,
    PaymentMethodDto,
    PaymentTimingDto,
    PaymentAmountRangeDto,
    PaymentDistributionQueryDto 
} from './dto/payment-distribution.dto';
import { 
    ComprehensiveAnalyticsDto,
    AnalyticsSummaryDto,
    TopCustomerDto,
    AnalyticsQueryDto 
} from './dto/analytics-response.dto';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getRevenueTrends(
        tenantIds: string[],
        query: RevenueTrendQueryDto = {},
    ): Promise<RevenueTrendDto[]> {
        return this.executeQuery('getRevenueTrends', async () => {
            const { startDate, endDate, period = 'monthly' } = query;
            
            // Set default date range to last 12 months if not provided
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

            const actualStartDate = startDate || defaultStartDate.toISOString().split('T')[0];
            const actualEndDate = endDate || defaultEndDate.toISOString().split('T')[0];

            // Build the date truncation based on period
            let dateTrunc: string;
            switch (period) {
                case 'daily':
                    dateTrunc = "DATE_TRUNC('day', \"issueDate\")";
                    break;
                case 'weekly':
                    dateTrunc = "DATE_TRUNC('week', \"issueDate\")";
                    break;
                case 'quarterly':
                    dateTrunc = "DATE_TRUNC('quarter', \"issueDate\")";
                    break;
                default:
                    dateTrunc = "DATE_TRUNC('month', \"issueDate\")";
            }

            const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
                .select([
                    `${dateTrunc} as date`,
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(*) as invoiceCount'
                ])
                .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                .groupBy('1')
                .orderBy('1', 'ASC');

            const results = await queryBuilder.getRawMany();

            return results.map(result => ({
                date: result.date.toISOString().split('T')[0],
                revenue: parseFloat(result.revenue) || 0,
                invoiceCount: parseInt(result.invoicecount) || 0,
            }));
        });
    }

    async getTenantMetrics(
        tenantIds: string[],
        query: TenantMetricsQueryDto = {},
    ): Promise<TenantMetricsDto[]> {
        try {
            const { startDate, endDate, limit = 20, sortBy = 'revenue' } = query;

            // Set default date range to last 12 months if not provided
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

            const actualStartDate = startDate || defaultStartDate.toISOString().split('T')[0];
            const actualEndDate = endDate || defaultEndDate.toISOString().split('T')[0];

            const currentDate = new Date().toISOString().split('T')[0];

            const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'invoice.tenantId as tenantId',
                    'tenant.name as tenantName',
                    'COUNT(*) as totalInvoices',
                    'AVG(invoice.totalAmount) as averageInvoiceValue',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'COUNT(CASE WHEN invoice.dueDate < :currentDate THEN 1 END) as paidInvoices',
                    'COUNT(CASE WHEN invoice.dueDate >= :currentDate THEN 1 END) as unpaidInvoices',
                    'COUNT(CASE WHEN invoice.dueDate < :currentDate AND invoice.totalAmount > 0 THEN 1 END) as overdueInvoices',
                ])
                .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                .setParameter('currentDate', currentDate)
                .groupBy('invoice.tenantId, tenant.name')
                .take(limit);

            // Apply sorting
            switch (sortBy) {
                case 'invoiceCount':
                    queryBuilder.orderBy('COUNT(*)', 'DESC');
                    break;
                case 'paymentTimeliness':
                    queryBuilder.orderBy('COUNT(CASE WHEN invoice.dueDate < :currentDate THEN 1 END)', 'DESC');
                    break;
                default:
                    queryBuilder.orderBy('SUM(invoice.totalAmount)', 'DESC');
            }

            const results = await queryBuilder.getRawMany();

            return results.map(result => {
                const totalInvoices = parseInt(result.totalinvoices) || 0;
                const paidInvoices = parseInt(result.paidinvoices) || 0;
                const unpaidInvoices = parseInt(result.unpaidinvoices) || 0;
                const overdueInvoices = parseInt(result.overdueinvoices) || 0;
                
                const paymentTimeliness = totalInvoices > 0 
                    ? (paidInvoices / totalInvoices) * 100 
                    : 0;

                return {
                    tenantId: result.tenantid,
                    tenantName: result.tenantname || 'Unknown Tenant',
                    totalInvoices,
                    averageInvoiceValue: parseFloat(result.averageinvoicevalue) || 0,
                    totalRevenue: parseFloat(result.totalrevenue) || 0,
                    paidInvoices,
                    unpaidInvoices,
                    overdueInvoices,
                    paymentTimeliness: Math.round(paymentTimeliness * 100) / 100,
                };
            });
        } catch (error) {
            this.logger.error('Error getting tenant metrics:', error);
            throw new BadRequestException('Failed to retrieve tenant metrics');
        }
    }

    async getInvoiceStatusOverview(
        tenantIds: string[],
        query: InvoiceStatusQueryDto = {},
    ): Promise<InvoiceStatusOverviewDto> {
        try {
            const { startDate, endDate, includeAging = true } = query;

            // Set default date range to last 12 months if not provided
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

            const actualStartDate = startDate || defaultStartDate.toISOString().split('T')[0];
            const actualEndDate = endDate || defaultEndDate.toISOString().split('T')[0];
            const currentDate = new Date().toISOString().split('T')[0];

            // Get status breakdown
            const statusQuery = this.invoiceRepository.createQueryBuilder('invoice')
                .select([
                    `CASE 
                        WHEN invoice.dueDate < :currentDate THEN 'overdue'
                        WHEN invoice.dueDate >= :currentDate THEN 'unpaid'
                        ELSE 'paid'
                    END as status`,
                    'COUNT(*) as count',
                    'SUM(invoice.totalAmount) as totalValue'
                ])
                .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                .setParameter('currentDate', currentDate)
                .groupBy('1');

            const statusResults = await statusQuery.getRawMany();

            // Calculate totals for percentage calculation
            const totalInvoices = statusResults.reduce((sum, result) => sum + parseInt(result.count), 0);
            const totalValue = statusResults.reduce((sum, result) => sum + parseFloat(result.totalvalue), 0);

            const statusBreakdown: InvoiceStatusDto[] = statusResults.map(result => ({
                status: result.status as 'paid' | 'unpaid' | 'overdue',
                count: parseInt(result.count) || 0,
                totalValue: parseFloat(result.totalvalue) || 0,
                percentage: totalInvoices > 0 
                    ? Math.round((parseInt(result.count) / totalInvoices) * 10000) / 100
                    : 0,
            }));

            let agingAnalysis: InvoiceAgingDto[] = [];

            if (includeAging) {
                // Get aging analysis for overdue invoices
                const agingQuery = this.invoiceRepository.createQueryBuilder('invoice')
                    .select([
                        `CASE 
                            WHEN (CURRENT_DATE - invoice.dueDate) <= 30 THEN '0-30'
                            WHEN (CURRENT_DATE - invoice.dueDate) <= 60 THEN '31-60'
                            WHEN (CURRENT_DATE - invoice.dueDate) <= 90 THEN '61-90'
                            ELSE '90+'
                        END as ageRange`,
                        'COUNT(*) as count',
                        'SUM(invoice.totalAmount) as totalValue'
                    ])
                    .where('invoice.dueDate < :currentDate', { currentDate })
                    .andWhere('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                    .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                    .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                    .groupBy('1')
                    .orderBy('1');

                const agingResults = await agingQuery.getRawMany();
                const totalOverdueValue = agingResults.reduce((sum, result) => sum + parseFloat(result.totalvalue), 0);

                agingAnalysis = agingResults.map(result => ({
                    ageRange: result.agerange,
                    count: parseInt(result.count) || 0,
                    totalValue: parseFloat(result.totalvalue) || 0,
                    percentage: totalOverdueValue > 0 
                        ? Math.round((parseFloat(result.totalvalue) / totalOverdueValue) * 10000) / 100
                        : 0,
                }));
            }

            return {
                statusBreakdown,
                agingAnalysis,
                totalInvoices,
                totalValue,
            };
        } catch (error) {
            this.logger.error('Error getting invoice status overview:', error);
            throw new BadRequestException('Failed to retrieve invoice status overview');
        }
    }

    async getPaymentDistribution(
        tenantIds: string[],
        query: PaymentDistributionQueryDto = {},
    ): Promise<PaymentDistributionDto> {
        try {
            const { 
                startDate, 
                endDate, 
                includeMethods = true, 
                includeTiming = true, 
                includeAmountRanges = true 
            } = query;

            // Set default date range to last 12 months if not provided
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

            const actualStartDate = startDate || defaultStartDate.toISOString().split('T')[0];
            const actualEndDate = endDate || defaultEndDate.toISOString().split('T')[0];

            // Get basic payment statistics
            const totalQuery = this.invoiceRepository.createQueryBuilder('invoice')
                .select([
                    'COUNT(*) as totalPayments',
                    'SUM(invoice.totalAmount) as totalPaymentValue'
                ])
                .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds });

            const totalResult = await totalQuery.getRawOne();
            const totalPayments = parseInt(totalResult?.totalpayments) || 0;
            const totalPaymentValue = parseFloat(totalResult?.totalpaymentvalue) || 0;

            // Initialize result arrays
            let paymentMethods: PaymentMethodDto[] = [];
            let paymentTiming: PaymentTimingDto[] = [];
            let amountRanges: PaymentAmountRangeDto[] = [];

            // Mock payment methods data (since we don't have a payment method field in Invoice entity)
            if (includeMethods) {
                paymentMethods = [
                    {
                        method: 'Credit Card',
                        count: Math.floor(totalPayments * 0.4),
                        totalValue: totalPaymentValue * 0.4,
                        percentage: 40.0,
                    },
                    {
                        method: 'Bank Transfer',
                        count: Math.floor(totalPayments * 0.35),
                        totalValue: totalPaymentValue * 0.35,
                        percentage: 35.0,
                    },
                    {
                        method: 'Check',
                        count: Math.floor(totalPayments * 0.15),
                        totalValue: totalPaymentValue * 0.15,
                        percentage: 15.0,
                    },
                    {
                        method: 'Cash',
                        count: Math.floor(totalPayments * 0.1),
                        totalValue: totalPaymentValue * 0.1,
                        percentage: 10.0,
                    },
                ];
            }

            // Payment timing analysis based on due date vs current date
            if (includeTiming) {
                const currentDate = new Date().toISOString().split('T')[0];
                
                const timingQuery = this.invoiceRepository.createQueryBuilder('invoice')
                    .select([
                        `CASE 
                            WHEN invoice.dueDate > :currentDate THEN 'Early'
                            WHEN invoice.dueDate = :currentDate THEN 'On Time'
                            ELSE 'Late'
                        END as timing`,
                        'COUNT(*) as count',
                        'SUM(invoice.totalAmount) as totalValue',
                        'AVG(EXTRACT(DAYS FROM (invoice.dueDate - CURRENT_DATE))) as averageDaysFromDue'
                    ])
                    .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                    .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                    .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                    .setParameter('currentDate', currentDate)
                    .groupBy('1');

                const timingResults = await timingQuery.getRawMany();

                paymentTiming = timingResults.map(result => ({
                    timing: result.timing as 'Early' | 'On Time' | 'Late',
                    count: parseInt(result.count) || 0,
                    totalValue: parseFloat(result.totalvalue) || 0,
                    percentage: totalPayments > 0 
                        ? Math.round((parseInt(result.count) / totalPayments) * 10000) / 100
                        : 0,
                    averageDaysFromDue: parseFloat(result.averagedaysfromdue) || 0,
                }));
            }

            // Amount ranges analysis
            if (includeAmountRanges) {
                const rangeQuery = this.invoiceRepository.createQueryBuilder('invoice')
                    .select([
                        `CASE 
                            WHEN invoice.totalAmount < 1000 THEN '$0 - $1,000'
                            WHEN invoice.totalAmount < 5000 THEN '$1,000 - $5,000'
                            WHEN invoice.totalAmount < 10000 THEN '$5,000 - $10,000'
                            WHEN invoice.totalAmount < 25000 THEN '$10,000 - $25,000'
                            ELSE '$25,000+'
                        END as range`,
                        'COUNT(*) as count',
                        'SUM(invoice.totalAmount) as totalValue'
                    ])
                    .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                    .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                    .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                    .groupBy('1')
                    .orderBy('MIN(invoice.totalAmount)');

                const rangeResults = await rangeQuery.getRawMany();

                amountRanges = rangeResults.map(result => ({
                    range: result.range,
                    count: parseInt(result.count) || 0,
                    totalValue: parseFloat(result.totalvalue) || 0,
                    percentage: totalPaymentValue > 0 
                        ? Math.round((parseFloat(result.totalvalue) / totalPaymentValue) * 10000) / 100
                        : 0,
                }));
            }

            return {
                paymentMethods,
                paymentTiming,
                amountRanges,
                totalPayments,
                totalPaymentValue,
            };
        } catch (error) {
            this.logger.error('Error getting payment distribution:', error);
            throw new BadRequestException('Failed to retrieve payment distribution');
        }
    }

    async getTopCustomers(tenantIds: string[], limit: number = 10): Promise<TopCustomerDto[]> {
        try {
            const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
                .select([
                    'invoice.customerName as customerName',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'COUNT(*) as invoiceCount',
                    'AVG(invoice.totalAmount) as averageInvoiceValue'
                ])
                .where('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                .groupBy('invoice.customerName')
                .orderBy('SUM(invoice.totalAmount)', 'DESC')
                .take(limit);

            const results = await queryBuilder.getRawMany();

            return results.map(result => ({
                customerName: result.customername || 'Unknown Customer',
                totalRevenue: parseFloat(result.totalrevenue) || 0,
                invoiceCount: parseInt(result.invoicecount) || 0,
                averageInvoiceValue: parseFloat(result.averageinvoicevalue) || 0,
            }));
        } catch (error) {
            this.logger.error('Error getting top customers:', error);
            throw new BadRequestException('Failed to retrieve top customers');
        }
    }

    async getAnalyticsSummary(tenantIds: string[], startDate?: string, endDate?: string): Promise<AnalyticsSummaryDto> {
        try {
            // Set default date range to last 12 months if not provided
            const defaultEndDate = new Date();
            const defaultStartDate = new Date();
            defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

            const actualStartDate = startDate || defaultStartDate.toISOString().split('T')[0];
            const actualEndDate = endDate || defaultEndDate.toISOString().split('T')[0];

            // Get current period summary
            const currentQuery = this.invoiceRepository.createQueryBuilder('invoice')
                .select([
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'COUNT(*) as totalInvoices',
                    'AVG(invoice.totalAmount) as averageInvoiceValue'
                ])
                .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds });

            const currentResult = await currentQuery.getRawOne();

            // Get previous period for comparison (same duration before start date)
            const periodLength = new Date(actualEndDate).getTime() - new Date(actualStartDate).getTime();
            const previousEndDate = new Date(new Date(actualStartDate).getTime() - 1);
            const previousStartDate = new Date(previousEndDate.getTime() - periodLength);

            const previousQuery = this.invoiceRepository.createQueryBuilder('invoice')
                .select([
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'COUNT(*) as totalInvoices'
                ])
                .where('invoice.issueDate >= :startDate', { startDate: previousStartDate.toISOString().split('T')[0] })
                .andWhere('invoice.issueDate <= :endDate', { endDate: previousEndDate.toISOString().split('T')[0] })
                .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds });

            const previousResult = await previousQuery.getRawOne();

            // Calculate growth percentages
            const currentRevenue = parseFloat(currentResult?.totalrevenue) || 0;
            const previousRevenue = parseFloat(previousResult?.totalrevenue) || 0;
            const revenueGrowth = previousRevenue > 0 
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
                : 0;

            const currentInvoices = parseInt(currentResult?.totalinvoices) || 0;
            const previousInvoices = parseInt(previousResult?.totalinvoices) || 0;
            const invoiceGrowth = previousInvoices > 0 
                ? ((currentInvoices - previousInvoices) / previousInvoices) * 100 
                : 0;

            // Calculate collection efficiency and average days to payment (simplified)
            const currentDate = new Date().toISOString().split('T')[0];
            
            const collectionQuery = this.invoiceRepository.createQueryBuilder('invoice')
                .select([
                    'COUNT(CASE WHEN invoice.dueDate >= :currentDate THEN 1 END) as paidCount',
                    'COUNT(*) as totalCount',
                    'AVG(EXTRACT(DAYS FROM (invoice.dueDate - invoice.issueDate))) as averageDaysToPayment'
                ])
                .where('invoice.issueDate >= :startDate', { startDate: actualStartDate })
                .andWhere('invoice.issueDate <= :endDate', { endDate: actualEndDate })
                .andWhere('invoice.tenantId IN (:...tenantIds)', { tenantIds })
                .setParameter('currentDate', currentDate);

            const collectionResult = await collectionQuery.getRawOne();

            const paidCount = parseInt(collectionResult?.paidcount) || 0;
            const totalCount = parseInt(collectionResult?.totalcount) || 0;
            const collectionEfficiency = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
            const averageDaysToPayment = parseFloat(collectionResult?.averagedaystopayment) || 0;

            return {
                totalRevenue: currentRevenue,
                totalInvoices: currentInvoices,
                averageInvoiceValue: parseFloat(currentResult?.averageinvoicevalue) || 0,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                invoiceGrowth: Math.round(invoiceGrowth * 100) / 100,
                collectionEfficiency: Math.round(collectionEfficiency * 100) / 100,
                averageDaysToPayment: Math.round(averageDaysToPayment * 100) / 100,
            };
        } catch (error) {
            this.logger.error('Error getting analytics summary:', error);
            throw new BadRequestException('Failed to retrieve analytics summary');
        }
    }

    async getComprehensiveAnalytics(
        tenantIds: string[],
        query: AnalyticsQueryDto = {},
    ): Promise<ComprehensiveAnalyticsDto> {
        try {
            const {
                startDate,
                endDate,
                includeRevenueTrends = true,
                includeTopCustomers = true,
                includeTenantMetrics = true,
                includeInvoiceStatus = true,
                includePaymentDistribution = true,
            } = query;

            // Get analytics summary (always included)
            const summary = await this.getAnalyticsSummary(tenantIds, startDate, endDate);

            // Get optional components based on query parameters
            const [
                revenueTrends,
                topCustomers,
                tenantMetrics,
                invoiceStatus,
                paymentDistribution
            ] = await Promise.all([
                includeRevenueTrends ? this.getRevenueTrends(tenantIds, { startDate, endDate }) : Promise.resolve([]),
                includeTopCustomers ? this.getTopCustomers(tenantIds, 10) : Promise.resolve([]),
                includeTenantMetrics ? this.getTenantMetrics(tenantIds, { startDate, endDate }) : Promise.resolve([]),
                includeInvoiceStatus ? this.getInvoiceStatusOverview(tenantIds, { startDate, endDate }) : Promise.resolve({
                    statusBreakdown: [],
                    agingAnalysis: [],
                    totalInvoices: 0,
                    totalValue: 0,
                }),
                includePaymentDistribution ? this.getPaymentDistribution(tenantIds, { startDate, endDate }) : Promise.resolve({
                    paymentMethods: [],
                    paymentTiming: [],
                    amountRanges: [],
                    totalPayments: 0,
                    totalPaymentValue: 0,
                }),
            ]);

            return {
                summary,
                revenueTrends,
                topCustomers,
                tenantMetrics,
                invoiceStatus,
                paymentDistribution,
            };
        } catch (error) {
            this.logger.error('Error getting comprehensive analytics:', error);
            throw new BadRequestException('Failed to retrieve comprehensive analytics');
        }
    }

    private validateDateRange(startDate?: string, endDate?: string): void {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start > end) {
                throw new BadRequestException('Start date must be before end date');
            }
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
            }
        }
    }

    private async executeQuery<T>(queryName: string, queryFunction: () => Promise<T>): Promise<T> {
        const startTime = Date.now();
        
        try {
            const result = await queryFunction();
            const duration = Date.now() - startTime;
            
            if (duration > 5000) { // Log slow queries (>5 seconds)
                this.logger.warn(`Slow analytics query detected: ${queryName} took ${duration}ms`);
            } else {
                this.logger.debug(`Analytics query ${queryName} completed in ${duration}ms`);
            }
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Analytics query ${queryName} failed after ${duration}ms:`, error);
            throw error;
        }
    }

    private getCacheKey(method: string, tenantIds: string[], params: any = {}): string {
        const tenantKey = tenantIds.sort().join(',');
        const paramKey = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        return `analytics:${method}:${tenantKey}:${paramKey}`;
    }

    // Cache TTL: 5 minutes for analytics data
    private readonly CACHE_TTL = 5 * 60 * 1000;
}