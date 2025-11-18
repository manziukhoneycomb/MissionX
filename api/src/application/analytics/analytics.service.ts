import { Injectable, Logger, Inject, CACHE_MANAGER, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Cache } from 'cache-manager';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { RevenueAnalyticsDto, RevenueTrendDto } from './dto/revenue-trend.dto';
import { TenantMetricsDto, TenantPerformanceDto } from './dto/tenant-metrics.dto';
import {
    InvoiceStatusOverviewDto,
    InvoiceStatusCountDto,
    AgingAnalysisDto,
} from './dto/invoice-status.dto';
import {
    PaymentDistributionDto,
    CustomerPaymentStatsDto,
    PaymentAmountRangeDto,
} from './dto/payment-distribution.dto';
import { ComprehensiveAnalyticsDto } from './dto/analytics-response.dto';
import { AnalyticsQueryDto, DateRange, TimeGroup } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async getComprehensiveAnalytics(
        tenantId: string,
        query: AnalyticsQueryDto,
    ): Promise<ComprehensiveAnalyticsDto> {
        this.logger.log(`Getting comprehensive analytics for tenant: ${tenantId}`);

        try {
            this.validateTenantId(tenantId);
            this.validateQuery(query);

            const dateRange = this.getDateRange(query);

            const [revenueAnalytics, tenantMetrics, invoiceStatus, paymentDistribution] =
                await Promise.allSettled([
                    this.getRevenueAnalytics(tenantId, query),
                    this.getTenantMetrics(tenantId, query),
                    this.getInvoiceStatusOverview(tenantId, query),
                    this.getPaymentDistribution(tenantId, query),
                ]);

            // Handle any failed promises
            const failures = [revenueAnalytics, tenantMetrics, invoiceStatus, paymentDistribution]
                .map((result, index) => ({ result, index }))
                .filter(({ result }) => result.status === 'rejected');

            if (failures.length > 0) {
                this.logger.error('Some analytics components failed', {
                    failures: failures.map(({ index }) => index),
                    tenant: tenantId,
                });
            }

            return {
                revenueAnalytics: revenueAnalytics.status === 'fulfilled' ? revenueAnalytics.value : this.getEmptyRevenueAnalytics(),
                tenantMetrics: tenantMetrics.status === 'fulfilled' ? tenantMetrics.value : this.getEmptyTenantMetrics(),
                invoiceStatus: invoiceStatus.status === 'fulfilled' ? invoiceStatus.value : this.getEmptyInvoiceStatus(),
                paymentDistribution: paymentDistribution.status === 'fulfilled' ? paymentDistribution.value : this.getEmptyPaymentDistribution(),
                generatedAt: new Date().toISOString(),
                dateRange,
            };
        } catch (error) {
            this.logger.error('Failed to get comprehensive analytics', error);
            throw new InternalServerErrorException('Failed to retrieve analytics data');
        }
    }

    async getRevenueAnalytics(
        tenantId: string,
        query: AnalyticsQueryDto,
    ): Promise<RevenueAnalyticsDto> {
        this.logger.log(`Getting revenue analytics for tenant: ${tenantId}`);

        try {
            this.validateTenantId(tenantId);
            this.validateQuery(query);

            return this.executeWithCache(tenantId, 'getRevenueAnalytics', query, async () => {
                const { startDate, endDate } = this.getDateRange(query);

                // Get monthly trends
                const monthlyTrends = await this.getRevenueTrends(tenantId, startDate, endDate, 'month');

                // Get quarterly trends
                const quarterlyTrends = await this.getRevenueTrends(tenantId, startDate, endDate, 'quarter');

                // Calculate total revenue and growth
                const totalRevenue = monthlyTrends.reduce((sum, trend) => sum + trend.totalRevenue, 0);
                const growthPercentage = this.calculateGrowthPercentage(monthlyTrends);

                return {
                    monthlyTrends,
                    quarterlyTrends,
                    totalRevenue,
                    growthPercentage,
                };
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.handleDatabaseError(error, 'get revenue analytics');
        }
    }

    async getTenantMetrics(tenantId: string, query: AnalyticsQueryDto): Promise<TenantMetricsDto> {
        this.logger.log(`Getting tenant metrics for tenant: ${tenantId}`);

        const { startDate, endDate } = this.getDateRange(query);
        const limit = query.limit || 10;

        // Get all tenant performance data
        const tenantPerformanceQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'invoice.tenantId as "tenantId"',
                'COUNT(invoice.id) as "totalInvoices"',
                'SUM(invoice.totalAmount) as "totalRevenue"',
                'AVG(invoice.totalAmount) as "averageInvoiceValue"',
                'COUNT(CASE WHEN invoice.dueDate >= CURRENT_DATE THEN 1 END) as "paidInvoices"',
                'COUNT(CASE WHEN invoice.dueDate < CURRENT_DATE THEN 1 END) as "overdueInvoices"',
            ])
            .where('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('invoice.tenantId')
            .orderBy('SUM(invoice.totalAmount)', 'DESC');

        const performanceResults = await tenantPerformanceQuery.getRawMany();

        // Get tenant names
        const tenantIds = performanceResults.map((result) => result.tenantId);
        const tenants = await this.tenantRepository
            .createQueryBuilder('tenant')
            .where('tenant.id IN (:...tenantIds)', { tenantIds })
            .getMany();

        const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant.name]));

        const allTenants: TenantPerformanceDto[] = performanceResults.map((result) => ({
            tenantId: result.tenantId,
            tenantName: tenantMap.get(result.tenantId),
            totalInvoices: parseInt(result.totalInvoices),
            totalRevenue: parseFloat(result.totalRevenue) || 0,
            averageInvoiceValue: parseFloat(result.averageInvoiceValue) || 0,
            paidInvoices: parseInt(result.paidInvoices) || 0,
            overdueInvoices: parseInt(result.overdueInvoices) || 0,
            paymentTimeliness:
                parseInt(result.totalInvoices) > 0
                    ? (parseInt(result.paidInvoices) / parseInt(result.totalInvoices)) * 100
                    : 0,
        }));

        const topTenants = allTenants.slice(0, limit);
        const totalActiveTenants = allTenants.length;
        const averageInvoicesPerTenant =
            totalActiveTenants > 0
                ? allTenants.reduce((sum, tenant) => sum + tenant.totalInvoices, 0) /
                  totalActiveTenants
                : 0;

        return {
            topTenants,
            allTenants,
            totalActiveTenants,
            averageInvoicesPerTenant,
        };
    }

    async getInvoiceStatusOverview(
        tenantId: string,
        query: AnalyticsQueryDto,
    ): Promise<InvoiceStatusOverviewDto> {
        this.logger.log(`Getting invoice status overview for tenant: ${tenantId}`);

        const { startDate, endDate } = this.getDateRange(query);

        // Get status breakdown
        const statusQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'CASE WHEN invoice.dueDate >= CURRENT_DATE THEN \'paid\' ELSE \'overdue\' END as status',
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as "totalAmount"',
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy(
                'CASE WHEN invoice.dueDate >= CURRENT_DATE THEN \'paid\' ELSE \'overdue\' END',
            )
            .getRawMany();

        const totalInvoicesResult = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select(['COUNT(invoice.id) as count', 'SUM(invoice.totalAmount) as "totalAmount"'])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getRawOne();

        const totalInvoices = parseInt(totalInvoicesResult?.count) || 0;
        const totalAmount = parseFloat(totalInvoicesResult?.totalAmount) || 0;

        const statusBreakdown: InvoiceStatusCountDto[] = statusQuery.map((result) => ({
            status: result.status,
            count: parseInt(result.count),
            totalAmount: parseFloat(result.totalAmount),
            percentage: totalInvoices > 0 ? (parseInt(result.count) / totalInvoices) * 100 : 0,
        }));

        // Add unpaid status if not present
        if (!statusBreakdown.find((s) => s.status === 'unpaid')) {
            statusBreakdown.push({
                status: 'unpaid',
                count: 0,
                totalAmount: 0,
                percentage: 0,
            });
        }

        // Get aging analysis for overdue invoices
        const agingQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'CASE ' +
                    'WHEN CURRENT_DATE - invoice.dueDate <= 30 THEN \'0-30\' ' +
                    'WHEN CURRENT_DATE - invoice.dueDate <= 60 THEN \'31-60\' ' +
                    'WHEN CURRENT_DATE - invoice.dueDate <= 90 THEN \'61-90\' ' +
                    'ELSE \'90+\' END as "ageRange"',
                'COUNT(invoice.id) as "invoiceCount"',
                'SUM(invoice.totalAmount) as "totalAmount"',
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.dueDate < CURRENT_DATE')
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy(
                'CASE ' +
                    'WHEN CURRENT_DATE - invoice.dueDate <= 30 THEN \'0-30\' ' +
                    'WHEN CURRENT_DATE - invoice.dueDate <= 60 THEN \'31-60\' ' +
                    'WHEN CURRENT_DATE - invoice.dueDate <= 90 THEN \'61-90\' ' +
                    'ELSE \'90+\' END',
            )
            .getRawMany();

        const totalOverdueAmount = agingQuery.reduce(
            (sum, result) => sum + parseFloat(result.totalAmount),
            0,
        );

        const agingAnalysis: AgingAnalysisDto[] = agingQuery.map((result) => ({
            ageRange: result.ageRange,
            invoiceCount: parseInt(result.invoiceCount),
            totalAmount: parseFloat(result.totalAmount),
            percentageOfOverdue:
                totalOverdueAmount > 0
                    ? (parseFloat(result.totalAmount) / totalOverdueAmount) * 100
                    : 0,
        }));

        const paidAmount =
            statusBreakdown.find((s) => s.status === 'paid')?.totalAmount || 0;
        const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

        return {
            statusBreakdown,
            agingAnalysis,
            totalInvoices,
            totalAmount,
            collectionRate,
        };
    }

    async getPaymentDistribution(
        tenantId: string,
        query: AnalyticsQueryDto,
    ): Promise<PaymentDistributionDto> {
        this.logger.log(`Getting payment distribution for tenant: ${tenantId}`);

        const { startDate, endDate } = this.getDateRange(query);
        const limit = query.limit || 10;

        // Get top customers
        const customerQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'invoice.customerName as "customerName"',
                'SUM(invoice.totalAmount) as "totalAmount"',
                'COUNT(invoice.id) as "invoiceCount"',
                'AVG(invoice.totalAmount) as "averagePayment"',
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('invoice.customerName')
            .orderBy('SUM(invoice.totalAmount)', 'DESC')
            .limit(limit)
            .getRawMany();

        const totalRevenueResult = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.totalAmount) as "totalRevenue"')
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getRawOne();

        const totalRevenue = parseFloat(totalRevenueResult?.totalRevenue) || 0;

        const topCustomers: CustomerPaymentStatsDto[] = customerQuery.map((result) => ({
            customerName: result.customerName,
            totalAmount: parseFloat(result.totalAmount),
            invoiceCount: parseInt(result.invoiceCount),
            averagePayment: parseFloat(result.averagePayment),
            revenuePercentage:
                totalRevenue > 0 ? (parseFloat(result.totalAmount) / totalRevenue) * 100 : 0,
        }));

        // Get amount distribution
        const amountRanges = [
            { min: 0, max: 1000, label: '$0-$1000' },
            { min: 1000, max: 5000, label: '$1000-$5000' },
            { min: 5000, max: 10000, label: '$5000-$10000' },
            { min: 10000, max: 50000, label: '$10000-$50000' },
            { min: 50000, max: Number.MAX_VALUE, label: '$50000+' },
        ];

        const amountDistribution: PaymentAmountRangeDto[] = [];
        const totalPaymentsResult = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('COUNT(invoice.id) as count')
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getRawOne();

        const totalPayments = parseInt(totalPaymentsResult?.count) || 0;

        for (const range of amountRanges) {
            const rangeQuery = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    'COUNT(invoice.id) as "paymentCount"',
                    'SUM(invoice.totalAmount) as "totalAmount"',
                ])
                .where('invoice.tenantId = :tenantId', { tenantId })
                .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                })
                .andWhere('invoice.totalAmount >= :min AND invoice.totalAmount < :max', {
                    min: range.min,
                    max: range.max === Number.MAX_VALUE ? 999999999 : range.max,
                });

            const result = await rangeQuery.getRawOne();

            if (result && parseInt(result.paymentCount) > 0) {
                amountDistribution.push({
                    range: range.label,
                    paymentCount: parseInt(result.paymentCount),
                    totalAmount: parseFloat(result.totalAmount),
                    percentage:
                        totalPayments > 0
                            ? (parseInt(result.paymentCount) / totalPayments) * 100
                            : 0,
                });
            }
        }

        // Calculate summary statistics
        const statsQuery = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'AVG(invoice.totalAmount) as "averagePaymentAmount"',
                'COUNT(DISTINCT invoice.customerName) as "totalCustomers"',
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getRawOne();

        // Get median (approximate using percentile)
        const medianQuery = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('invoice.totalAmount')
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('invoice.totalAmount')
            .getMany();

        const medianPaymentAmount =
            medianQuery.length > 0
                ? medianQuery[Math.floor(medianQuery.length / 2)].totalAmount
                : 0;

        return {
            topCustomers,
            amountDistribution,
            averagePaymentAmount: parseFloat(statsQuery?.averagePaymentAmount) || 0,
            medianPaymentAmount,
            totalCustomers: parseInt(statsQuery?.totalCustomers) || 0,
        };
    }

    private async getRevenueTrends(
        tenantId: string,
        startDate: string,
        endDate: string,
        groupBy: 'month' | 'quarter',
    ): Promise<RevenueTrendDto[]> {
        try {
            const dateFormat = groupBy === 'month' ? 'YYYY-MM' : 'YYYY-Q';
            const dateTrunc = groupBy === 'month' ? 'month' : 'quarter';

            const query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    `TO_CHAR(DATE_TRUNC('${dateTrunc}', invoice.issueDate::date), '${dateFormat}') as period`,
                    `DATE_TRUNC('${dateTrunc}', invoice.issueDate::date) as "startDate"`,
                    `(DATE_TRUNC('${dateTrunc}', invoice.issueDate::date) + INTERVAL '1 ${dateTrunc}' - INTERVAL '1 day') as "endDate"`,
                    'SUM(invoice.totalAmount) as "totalRevenue"',
                    'COUNT(invoice.id) as "invoiceCount"',
                    'AVG(invoice.totalAmount) as "averageInvoiceAmount"',
                ])
                .where('invoice.tenantId = :tenantId', { tenantId })
                .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
                .groupBy(`DATE_TRUNC('${dateTrunc}', invoice.issueDate::date)`)
                .orderBy(`DATE_TRUNC('${dateTrunc}', invoice.issueDate::date)`);

            const results = await query.getRawMany();

            return results.map((result) => ({
                period: result.period || '',
                startDate: result.startDate ? new Date(result.startDate).toISOString().split('T')[0] : '',
                endDate: result.endDate ? new Date(result.endDate).toISOString().split('T')[0] : '',
                totalRevenue: parseFloat(result.totalRevenue) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
                averageInvoiceAmount: parseFloat(result.averageInvoiceAmount) || 0,
            }));
        } catch (error) {
            this.logger.error(`Failed to get ${groupBy} revenue trends for tenant ${tenantId}`, error);
            return [];
        }
    }

    private calculateGrowthPercentage(trends: RevenueTrendDto[]): number {
        if (trends.length < 2) return 0;

        const current = trends[trends.length - 1].totalRevenue;
        const previous = trends[trends.length - 2].totalRevenue;

        if (previous === 0) return current > 0 ? 100 : 0;

        return ((current - previous) / previous) * 100;
    }

    private getDateRange(query: AnalyticsQueryDto): { startDate: string; endDate: string } {
        if (query.startDate && query.endDate) {
            return {
                startDate: query.startDate,
                endDate: query.endDate,
            };
        }

        const now = new Date();
        const endDate = now.toISOString().split('T')[0];

        let startDate: string;

        switch (query.dateRange) {
            case DateRange.LAST_7_DAYS:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0];
                break;
            case DateRange.LAST_30_DAYS:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0];
                break;
            case DateRange.LAST_3_MONTHS:
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
                    .toISOString()
                    .split('T')[0];
                break;
            case DateRange.LAST_6_MONTHS:
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
                    .toISOString()
                    .split('T')[0];
                break;
            case DateRange.LAST_YEAR:
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
                    .toISOString()
                    .split('T')[0];
                break;
            default:
                // Default to last 6 months
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
                    .toISOString()
                    .split('T')[0];
        }

        return { startDate, endDate };
    }

    private generateCacheKey(tenantId: string, method: string, query: AnalyticsQueryDto): string {
        const dateRange = this.getDateRange(query);
        const queryHash = Buffer.from(
            JSON.stringify({
                tenantId,
                method,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                groupBy: query.groupBy,
                limit: query.limit,
            }),
        ).toString('base64');
        return `analytics:${queryHash}`;
    }

    private async getCachedResult<T>(cacheKey: string): Promise<T | null> {
        try {
            const cached = await this.cacheManager.get<T>(cacheKey);
            return cached || null;
        } catch (error) {
            this.logger.warn('Failed to retrieve cached result', error);
            return null;
        }
    }

    private async setCachedResult<T>(cacheKey: string, result: T, ttl: number = 300000): Promise<void> {
        try {
            await this.cacheManager.set(cacheKey, result, ttl); // 5 minutes default TTL
        } catch (error) {
            this.logger.warn('Failed to cache result', error);
        }
    }

    private async executeWithCache<T>(
        tenantId: string,
        method: string,
        query: AnalyticsQueryDto,
        executeFn: () => Promise<T>,
    ): Promise<T> {
        const cacheKey = this.generateCacheKey(tenantId, method, query);
        
        // Try to get cached result
        const cached = await this.getCachedResult<T>(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit for ${method}`);
            return cached;
        }

        // Execute the function
        this.logger.debug(`Cache miss for ${method}, executing query`);
        const result = await executeFn();

        // Cache the result
        await this.setCachedResult(cacheKey, result);

        return result;
    }

    private validateTenantId(tenantId: string): void {
        if (!tenantId || typeof tenantId !== 'string') {
            throw new BadRequestException('Valid tenant ID is required');
        }
    }

    private validateQuery(query: AnalyticsQueryDto): void {
        if (query.startDate && query.endDate) {
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new BadRequestException('Invalid date format');
            }

            if (startDate >= endDate) {
                throw new BadRequestException('Start date must be before end date');
            }
        }

        if (query.limit !== undefined && (query.limit < 1 || query.limit > 100)) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
    }

    private handleDatabaseError(error: unknown, operation: string): never {
        this.logger.error(`Database error during ${operation}`, error);

        if (error instanceof QueryFailedError) {
            throw new InternalServerErrorException(`Database query failed during ${operation}`);
        }

        throw new InternalServerErrorException(`Failed to ${operation}`);
    }

    private getEmptyRevenueAnalytics(): RevenueAnalyticsDto {
        return {
            monthlyTrends: [],
            quarterlyTrends: [],
            totalRevenue: 0,
            growthPercentage: 0,
        };
    }

    private getEmptyTenantMetrics(): TenantMetricsDto {
        return {
            topTenants: [],
            allTenants: [],
            totalActiveTenants: 0,
            averageInvoicesPerTenant: 0,
        };
    }

    private getEmptyInvoiceStatus(): InvoiceStatusOverviewDto {
        return {
            statusBreakdown: [
                { status: 'paid', count: 0, totalAmount: 0, percentage: 0 },
                { status: 'unpaid', count: 0, totalAmount: 0, percentage: 0 },
                { status: 'overdue', count: 0, totalAmount: 0, percentage: 0 },
            ],
            agingAnalysis: [],
            totalInvoices: 0,
            totalAmount: 0,
            collectionRate: 0,
        };
    }

    private getEmptyPaymentDistribution(): PaymentDistributionDto {
        return {
            topCustomers: [],
            amountDistribution: [],
            averagePaymentAmount: 0,
            medianPaymentAmount: 0,
            totalCustomers: 0,
        };
    }
}