import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import { AnalyticsQueryDto, AnalyticsResponseDto } from './dto/analytics-response.dto';
import { RevenueTrendDto, MonthlyRevenueDto, QuarterlyRevenueDto } from './dto/revenue-trend.dto';
import { TenantMetricsDto, TopCustomerDto } from './dto/tenant-metrics.dto';
import { InvoiceStatusDto, InvoiceAgingDto } from './dto/invoice-status.dto';
import {
    PaymentDistributionDto,
    PaymentTimingDto,
    AmountRangeDto,
    CustomerDistributionDto,
    VendorDistributionDto,
} from './dto/payment-distribution.dto';
import { AnalyticsErrorUtils } from './utils/analytics-error.utils';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);
    private readonly cache = new Map<string, { data: any; timestamp: number }>();
    private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getComprehensiveAnalytics(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<AnalyticsResponseDto> {
        const startTime = Date.now();
        
        try {
            const sanitizedParams = AnalyticsErrorUtils.sanitizeQueryParams(queryParams);
            AnalyticsErrorUtils.validateDateRange(sanitizedParams.startDate, sanitizedParams.endDate);
            
            const cacheKey = this.generateCacheKey('comprehensive', sanitizedParams, userTenantId);
            
            return await this.getCachedOrFetch(cacheKey, async () => {
                const [revenueTrends, tenantMetrics, invoiceStatus, paymentDistribution] =
                    await Promise.all([
                        this.getRevenueTrends(sanitizedParams, userTenantId),
                        this.getTenantMetrics(sanitizedParams, userTenantId),
                        this.getInvoiceStatus(sanitizedParams, userTenantId),
                        this.getPaymentDistribution(sanitizedParams, userTenantId),
                    ]);

                return {
                    revenueTrends,
                    tenantMetrics,
                    invoiceStatus,
                    paymentDistribution,
                };
            });
        } catch (error) {
            AnalyticsErrorUtils.handleQueryError(error, 'comprehensive analytics');
        } finally {
            AnalyticsErrorUtils.logPerformance('comprehensive analytics', startTime);
        }
    }

    async getRevenueTrends(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<RevenueTrendDto[]> {
        try {
            const { startDate, endDate, tenantId } = queryParams;
            const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

            let query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    "DATE_FORMAT(invoice.issueDate, '%Y-%m') as period",
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(*) as invoiceCount',
                    'AVG(invoice.totalAmount) as averageValue',
                ])
                .groupBy("DATE_FORMAT(invoice.issueDate, '%Y-%m')")
                .orderBy('period', 'ASC');

            if (effectiveTenantId) {
                query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
            }

            if (startDate) {
                query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
            }

            if (endDate) {
                query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
            }

            const results = await query.getRawMany();

            return results.map((result) => ({
                period: result.period,
                revenue: parseFloat(result.revenue) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
                averageValue: parseFloat(result.averageValue) || 0,
            }));
        } catch (error) {
            this.logger.error('Error fetching revenue trends:', error);
            throw new BadRequestException('Failed to fetch revenue trends');
        }
    }

    async getMonthlyRevenue(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<MonthlyRevenueDto[]> {
        try {
            const { startDate, endDate, tenantId } = queryParams;
            const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

            let query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    "DATE_FORMAT(invoice.issueDate, '%Y-%m') as month",
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(*) as invoiceCount',
                ])
                .groupBy("DATE_FORMAT(invoice.issueDate, '%Y-%m')")
                .orderBy('month', 'ASC');

            if (effectiveTenantId) {
                query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
            }

            if (startDate) {
                query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
            }

            if (endDate) {
                query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
            }

            const results = await query.getRawMany();

            return results.map((result) => ({
                month: result.month,
                revenue: parseFloat(result.revenue) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
            }));
        } catch (error) {
            this.logger.error('Error fetching monthly revenue:', error);
            throw new BadRequestException('Failed to fetch monthly revenue');
        }
    }

    async getQuarterlyRevenue(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<QuarterlyRevenueDto[]> {
        try {
            const { startDate, endDate, tenantId } = queryParams;
            const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

            let query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    "CONCAT('Q', QUARTER(invoice.issueDate), ' ', YEAR(invoice.issueDate)) as quarter",
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(*) as invoiceCount',
                ])
                .groupBy("QUARTER(invoice.issueDate), YEAR(invoice.issueDate)")
                .orderBy("YEAR(invoice.issueDate), QUARTER(invoice.issueDate)", 'ASC');

            if (effectiveTenantId) {
                query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
            }

            if (startDate) {
                query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
            }

            if (endDate) {
                query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
            }

            const results = await query.getRawMany();

            return results.map((result) => ({
                quarter: result.quarter,
                revenue: parseFloat(result.revenue) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
            }));
        } catch (error) {
            this.logger.error('Error fetching quarterly revenue:', error);
            throw new BadRequestException('Failed to fetch quarterly revenue');
        }
    }

    async getTenantMetrics(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<TenantMetricsDto[]> {
        try {
            const { startDate, endDate, tenantId } = queryParams;
            const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

            let query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'invoice.tenantId as tenantId',
                    'tenant.name as tenantName',
                    'COUNT(*) as invoiceCount',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'AVG(invoice.totalAmount) as averageInvoiceValue',
                    'SUM(CASE WHEN invoice.dueDate < CURDATE() THEN 1 ELSE 0 END) as overdueCount',
                ])
                .groupBy('invoice.tenantId, tenant.name')
                .orderBy('totalRevenue', 'DESC');

            if (effectiveTenantId) {
                query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
            }

            if (startDate) {
                query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
            }

            if (endDate) {
                query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
            }

            const results = await query.getRawMany();

            return results.map((result) => ({
                tenantId: result.tenantId,
                tenantName: result.tenantName || 'Unknown',
                invoiceCount: parseInt(result.invoiceCount) || 0,
                totalRevenue: parseFloat(result.totalRevenue) || 0,
                averageInvoiceValue: parseFloat(result.averageInvoiceValue) || 0,
                overdueCount: parseInt(result.overdueCount) || 0,
            }));
        } catch (error) {
            this.logger.error('Error fetching tenant metrics:', error);
            throw new BadRequestException('Failed to fetch tenant metrics');
        }
    }

    async getTopCustomers(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
        limit: number = 10,
    ): Promise<TopCustomerDto[]> {
        try {
            const { startDate, endDate, tenantId } = queryParams;
            const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

            let query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    'invoice.customerName as customerName',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'COUNT(*) as invoiceCount',
                    'AVG(invoice.totalAmount) as averageInvoiceValue',
                ])
                .groupBy('invoice.customerName')
                .orderBy('totalRevenue', 'DESC')
                .limit(limit);

            if (effectiveTenantId) {
                query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
            }

            if (startDate) {
                query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
            }

            if (endDate) {
                query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
            }

            const results = await query.getRawMany();

            return results.map((result) => ({
                customerName: result.customerName,
                totalRevenue: parseFloat(result.totalRevenue) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
                averageInvoiceValue: parseFloat(result.averageInvoiceValue) || 0,
            }));
        } catch (error) {
            this.logger.error('Error fetching top customers:', error);
            throw new BadRequestException('Failed to fetch top customers');
        }
    }

    async getInvoiceStatus(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<InvoiceStatusDto> {
        try {
            const { startDate, endDate, tenantId } = queryParams;
            const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

            let query = this.invoiceRepository.createQueryBuilder('invoice').select([
                'COUNT(*) as totalCount',
                'SUM(invoice.totalAmount) as totalAmount',
                'SUM(CASE WHEN invoice.dueDate >= CURDATE() THEN 1 ELSE 0 END) as unpaidCount',
                'SUM(CASE WHEN invoice.dueDate >= CURDATE() THEN invoice.totalAmount ELSE 0 END) as unpaidAmount',
                'SUM(CASE WHEN invoice.dueDate < CURDATE() THEN 1 ELSE 0 END) as overdueCount',
                'SUM(CASE WHEN invoice.dueDate < CURDATE() THEN invoice.totalAmount ELSE 0 END) as overdueAmount',
            ]);

            if (effectiveTenantId) {
                query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
            }

            if (startDate) {
                query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
            }

            if (endDate) {
                query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
            }

            const result = await query.getRawOne();

            const totalCount = parseInt(result.totalCount) || 0;
            const unpaidCount = parseInt(result.unpaidCount) || 0;
            const overdueCount = parseInt(result.overdueCount) || 0;
            const paidCount = Math.max(0, totalCount - unpaidCount - overdueCount);

            const totalAmount = parseFloat(result.totalAmount) || 0;
            const unpaidAmount = parseFloat(result.unpaidAmount) || 0;
            const overdueAmount = parseFloat(result.overdueAmount) || 0;
            const paidAmount = Math.max(0, totalAmount - unpaidAmount - overdueAmount);

            return {
                paidCount,
                unpaidCount,
                overdueCount,
                paidAmount,
                unpaidAmount,
                overdueAmount,
            };
        } catch (error) {
            this.logger.error('Error fetching invoice status:', error);
            throw new BadRequestException('Failed to fetch invoice status');
        }
    }

    async getInvoiceAging(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<InvoiceAgingDto[]> {
        try {
            const { startDate, endDate, tenantId } = queryParams;
            const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

            let query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    `CASE 
                        WHEN DATEDIFF(CURDATE(), invoice.dueDate) <= 0 THEN 'Current'
                        WHEN DATEDIFF(CURDATE(), invoice.dueDate) BETWEEN 1 AND 30 THEN '1-30 days'
                        WHEN DATEDIFF(CURDATE(), invoice.dueDate) BETWEEN 31 AND 60 THEN '31-60 days'
                        WHEN DATEDIFF(CURDATE(), invoice.dueDate) BETWEEN 61 AND 90 THEN '61-90 days'
                        ELSE '90+ days'
                    END as ageRange`,
                    'COUNT(*) as count',
                    'SUM(invoice.totalAmount) as totalValue',
                ])
                .groupBy('ageRange')
                .orderBy('ageRange', 'ASC');

            if (effectiveTenantId) {
                query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
            }

            if (startDate) {
                query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
            }

            if (endDate) {
                query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
            }

            const results = await query.getRawMany();
            const totalValue = results.reduce((sum, result) => sum + (parseFloat(result.totalValue) || 0), 0);

            return results.map((result) => {
                const value = parseFloat(result.totalValue) || 0;
                return {
                    ageRange: result.ageRange,
                    count: parseInt(result.count) || 0,
                    totalValue: value,
                    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
                };
            });
        } catch (error) {
            this.logger.error('Error fetching invoice aging:', error);
            throw new BadRequestException('Failed to fetch invoice aging');
        }
    }

    async getPaymentDistribution(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<PaymentDistributionDto> {
        try {
            const [byTiming, byAmountRange, byCustomer, byVendor] = await Promise.all([
                this.getPaymentTiming(queryParams, userTenantId),
                this.getAmountRangeDistribution(queryParams, userTenantId),
                this.getCustomerDistribution(queryParams, userTenantId),
                this.getVendorDistribution(queryParams, userTenantId),
            ]);

            return {
                byTiming,
                byAmountRange,
                byCustomer,
                byVendor,
            };
        } catch (error) {
            this.logger.error('Error fetching payment distribution:', error);
            throw new BadRequestException('Failed to fetch payment distribution');
        }
    }

    private async getPaymentTiming(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<PaymentTimingDto[]> {
        const { startDate, endDate, tenantId } = queryParams;
        const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

        let query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                `CASE 
                    WHEN DATEDIFF(CURDATE(), invoice.dueDate) < -7 THEN 'Early'
                    WHEN DATEDIFF(CURDATE(), invoice.dueDate) BETWEEN -7 AND 0 THEN 'On Time'
                    WHEN DATEDIFF(CURDATE(), invoice.dueDate) BETWEEN 1 AND 30 THEN 'Late'
                    ELSE 'Very Late'
                END as category`,
                'COUNT(*) as count',
                'SUM(invoice.totalAmount) as totalValue',
            ])
            .groupBy('category');

        if (effectiveTenantId) {
            query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
        }

        if (startDate) {
            query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
        }

        if (endDate) {
            query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
        }

        const results = await query.getRawMany();
        const totalCount = results.reduce((sum, result) => sum + (parseInt(result.count) || 0), 0);

        return results.map((result) => {
            const count = parseInt(result.count) || 0;
            return {
                category: result.category,
                count,
                totalValue: parseFloat(result.totalValue) || 0,
                percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
            };
        });
    }

    private async getAmountRangeDistribution(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<AmountRangeDto[]> {
        const { startDate, endDate, tenantId } = queryParams;
        const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

        let query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                `CASE 
                    WHEN invoice.totalAmount < 1000 THEN '$0-$1000'
                    WHEN invoice.totalAmount BETWEEN 1000 AND 5000 THEN '$1000-$5000'
                    WHEN invoice.totalAmount BETWEEN 5001 AND 10000 THEN '$5000-$10000'
                    WHEN invoice.totalAmount BETWEEN 10001 AND 50000 THEN '$10000-$50000'
                    ELSE '$50000+'
                END as range`,
                'COUNT(*) as count',
                'SUM(invoice.totalAmount) as totalValue',
            ])
            .groupBy('range');

        if (effectiveTenantId) {
            query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
        }

        if (startDate) {
            query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
        }

        if (endDate) {
            query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
        }

        const results = await query.getRawMany();
        const totalCount = results.reduce((sum, result) => sum + (parseInt(result.count) || 0), 0);

        return results.map((result) => {
            const count = parseInt(result.count) || 0;
            return {
                range: result.range,
                count,
                totalValue: parseFloat(result.totalValue) || 0,
                percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
            };
        });
    }

    private async getCustomerDistribution(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<CustomerDistributionDto[]> {
        const { startDate, endDate, tenantId } = queryParams;
        const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

        let query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'invoice.customerName as customerName',
                'COUNT(*) as invoiceCount',
                'SUM(invoice.totalAmount) as totalValue',
            ])
            .groupBy('invoice.customerName')
            .orderBy('totalValue', 'DESC')
            .limit(10);

        if (effectiveTenantId) {
            query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
        }

        if (startDate) {
            query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
        }

        if (endDate) {
            query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
        }

        const results = await query.getRawMany();
        const totalValue = results.reduce((sum, result) => sum + (parseFloat(result.totalValue) || 0), 0);

        return results.map((result) => {
            const value = parseFloat(result.totalValue) || 0;
            return {
                customerName: result.customerName,
                invoiceCount: parseInt(result.invoiceCount) || 0,
                totalValue: value,
                percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
            };
        });
    }

    private async getVendorDistribution(
        queryParams: AnalyticsQueryDto,
        userTenantId?: string,
    ): Promise<VendorDistributionDto[]> {
        const { startDate, endDate, tenantId } = queryParams;
        const effectiveTenantId = this.getEffectiveTenantId(tenantId, userTenantId);

        let query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'invoice.vendorName as vendorName',
                'COUNT(*) as invoiceCount',
                'SUM(invoice.totalAmount) as totalValue',
            ])
            .groupBy('invoice.vendorName')
            .orderBy('totalValue', 'DESC')
            .limit(10);

        if (effectiveTenantId) {
            query = query.where('invoice.tenantId = :tenantId', { tenantId: effectiveTenantId });
        }

        if (startDate) {
            query = query.andWhere('invoice.issueDate >= :startDate', { startDate });
        }

        if (endDate) {
            query = query.andWhere('invoice.issueDate <= :endDate', { endDate });
        }

        const results = await query.getRawMany();
        const totalCount = results.reduce((sum, result) => sum + (parseInt(result.invoiceCount) || 0), 0);

        return results.map((result) => {
            const count = parseInt(result.invoiceCount) || 0;
            return {
                vendorName: result.vendorName,
                invoiceCount: count,
                totalValue: parseFloat(result.totalValue) || 0,
                percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
            };
        });
    }

    private generateCacheKey(method: string, queryParams: AnalyticsQueryDto, userTenantId?: string): string {
        const effectiveTenantId = this.getEffectiveTenantId(queryParams.tenantId, userTenantId);
        return `analytics:${method}:${effectiveTenantId || 'all'}:${queryParams.startDate || 'nostart'}:${queryParams.endDate || 'noend'}`;
    }

    private getCachedData<T>(cacheKey: string): T | null {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            this.logger.debug(`Cache hit for key: ${cacheKey}`);
            return cached.data as T;
        }
        if (cached) {
            this.cache.delete(cacheKey);
        }
        return null;
    }

    private setCachedData<T>(cacheKey: string, data: T): void {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        this.logger.debug(`Data cached for key: ${cacheKey}`);
        
        // Simple cache cleanup - remove expired entries
        if (this.cache.size > 100) {
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp >= this.cacheTimeout) {
                    this.cache.delete(key);
                }
            }
        }
    }

    private async getCachedOrFetch<T>(
        cacheKey: string,
        fetchFunction: () => Promise<T>,
    ): Promise<T> {
        const cached = this.getCachedData<T>(cacheKey);
        if (cached) {
            return cached;
        }

        const startTime = Date.now();
        const data = await fetchFunction();
        const queryTime = Date.now() - startTime;
        
        this.logger.debug(`Query executed in ${queryTime}ms for key: ${cacheKey}`);
        
        this.setCachedData(cacheKey, data);
        return data;
    }

    private getEffectiveTenantId(requestedTenantId?: string, userTenantId?: string): string | undefined {
        if (requestedTenantId && !userTenantId) {
            return requestedTenantId;
        }
        return userTenantId;
    }
}