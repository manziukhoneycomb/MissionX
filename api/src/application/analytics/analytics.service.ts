import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { extractErrorInfo } from '../../domain/utils/error.utils';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import {
    AnalyticsDashboardDto,
    AnalyticsQueryDto,
    AnalyticsPeriodType,
} from './dto/analytics-response.dto';
import { RevenueTrendDto, RevenueTrendDataPointDto } from './dto/revenue-trend.dto';
import { TenantMetricsDto, TenantPerformanceDto } from './dto/tenant-metrics.dto';
import {
    InvoiceStatusOverviewDto,
    InvoiceStatusCountDto,
    AgingBucketDto,
} from './dto/invoice-status.dto';
import {
    PaymentDistributionDto,
    PaymentMethodDto,
    PaymentTimingDto,
} from './dto/payment-distribution.dto';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);
    private readonly cache = new Map<string, CacheEntry<any>>();
    private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    private getCacheKey(method: string, params: any): string {
        return `${method}_${JSON.stringify(params)}`;
    }

    private getFromCache<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL_MS): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
        
        // Clean up expired entries periodically (simple cleanup)
        if (this.cache.size > 100) {
            this.cleanupExpiredCache();
        }
    }

    private cleanupExpiredCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    async getRevenueTrend(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<RevenueTrendDto> {
        const cacheKey = this.getCacheKey('getRevenueTrend', { queryParams, tenantId });
        const cachedResult = this.getFromCache<RevenueTrendDto>(cacheKey);
        if (cachedResult) {
            this.logger.debug(`Cache hit for getRevenueTrend: ${cacheKey}`);
            return cachedResult;
        }

        try {
            const { startDate, endDate, periodType } = this.normalizeQueryParams(queryParams);
            
            const query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    this.getDateTruncExpression(periodType, 'invoice.issueDate') + ' as period',
                    'SUM(invoice.totalAmount) as totalAmount',
                    'COUNT(invoice.id) as invoiceCount',
                ])
                .where('invoice.issueDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                })
                .groupBy('period')
                .orderBy('period', 'ASC');

            if (tenantId) {
                query.andWhere('invoice.tenantId = :tenantId', { tenantId });
            }

            const results = await query.getRawMany();
            
            const dataPoints: RevenueTrendDataPointDto[] = results.map((row) => ({
                date: row.period,
                amount: parseFloat(row.totalamount) || 0,
                invoiceCount: parseInt(row.invoicecount) || 0,
            }));

            const totalRevenue = dataPoints.reduce((sum, point) => sum + point.amount, 0);
            const averageRevenue = dataPoints.length > 0 ? totalRevenue / dataPoints.length : 0;
            
            // Calculate growth percentage compared to first period
            let growthPercentage = 0;
            if (dataPoints.length > 1) {
                const firstPeriod = dataPoints[0].amount;
                const lastPeriod = dataPoints[dataPoints.length - 1].amount;
                if (firstPeriod > 0) {
                    growthPercentage = ((lastPeriod - firstPeriod) / firstPeriod) * 100;
                }
            }

            const result = {
                dataPoints,
                totalRevenue,
                averageRevenue,
                growthPercentage,
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            this.logger.error(`Error getting revenue trend: ${error}`);
            throw error;
        }
    }

    async getTenantMetrics(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<TenantMetricsDto> {
        try {
            const { startDate, endDate } = this.normalizeQueryParams(queryParams);
            
            const query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoinAndSelect('invoice.tenant', 'tenant')
                .select([
                    'invoice.tenantId as tenantId',
                    'tenant.name as tenantName',
                    'COUNT(invoice.id) as invoiceCount',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'AVG(invoice.totalAmount) as averageInvoiceValue',
                    'AVG(CASE WHEN DATE(invoice.dueDate) >= DATE(\'NOW\') THEN 1 ELSE 0 END) * 100 as onTimePaymentRate',
                    'AVG(julianday(\'NOW\') - julianday(invoice.dueDate)) as averagePaymentDays',
                ])
                .where('invoice.issueDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                })
                .groupBy('invoice.tenantId, tenant.name')
                .orderBy('totalRevenue', 'DESC');

            if (tenantId) {
                query.andWhere('invoice.tenantId = :tenantId', { tenantId });
            }

            const results = await query.getRawMany();
            
            const tenants: TenantPerformanceDto[] = results.map((row) => ({
                tenantId: row.tenantid,
                tenantName: row.tenantname || 'Unknown Tenant',
                invoiceCount: parseInt(row.invoicecount) || 0,
                totalRevenue: parseFloat(row.totalrevenue) || 0,
                averageInvoiceValue: parseFloat(row.averageinvoicevalue) || 0,
                onTimePaymentRate: parseFloat(row.ontimepaymentrate) || 0,
                averagePaymentDays: parseFloat(row.averagepaymentdays) || 0,
            }));

            const totalTenants = tenants.length;
            const topTenant = tenants.length > 0 ? tenants[0] : ({} as TenantPerformanceDto);
            const averageInvoiceValue = tenants.length > 0 
                ? tenants.reduce((sum, t) => sum + t.averageInvoiceValue, 0) / tenants.length 
                : 0;

            return {
                tenants,
                totalTenants,
                topTenant,
                averageInvoiceValue,
            };
        } catch (error) {
            this.logger.error(`Error getting tenant metrics: ${error}`);
            throw error;
        }
    }

    async getInvoiceStatusOverview(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<InvoiceStatusOverviewDto> {
        try {
            const { startDate, endDate } = this.normalizeQueryParams(queryParams);
            
            // Status breakdown - simplified logic for demo (in real app you'd have status field)
            const statusQuery = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    'CASE WHEN DATE(invoice.dueDate) < DATE(\'NOW\') THEN \'Overdue\' ELSE \'Current\' END as status',
                    'COUNT(invoice.id) as count',
                    'SUM(invoice.totalAmount) as totalValue',
                ])
                .where('invoice.issueDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                })
                .groupBy('status');

            if (tenantId) {
                statusQuery.andWhere('invoice.tenantId = :tenantId', { tenantId });
            }

            const statusResults = await statusQuery.getRawMany();
            const totalInvoices = statusResults.reduce((sum, row) => sum + parseInt(row.count), 0);
            
            const statusBreakdown: InvoiceStatusCountDto[] = statusResults.map((row) => {
                const count = parseInt(row.count) || 0;
                return {
                    status: row.status,
                    count,
                    totalValue: parseFloat(row.totalvalue) || 0,
                    percentage: totalInvoices > 0 ? (count / totalInvoices) * 100 : 0,
                };
            });

            // Aging analysis for overdue invoices
            const agingQuery = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    'CASE ' +
                    'WHEN julianday(\'NOW\') - julianday(invoice.dueDate) <= 30 THEN \'0-30 days\' ' +
                    'WHEN julianday(\'NOW\') - julianday(invoice.dueDate) <= 60 THEN \'31-60 days\' ' +
                    'WHEN julianday(\'NOW\') - julianday(invoice.dueDate) <= 90 THEN \'61-90 days\' ' +
                    'ELSE \'90+ days\' END as ageRange',
                    'COUNT(invoice.id) as count',
                    'SUM(invoice.totalAmount) as totalValue',
                    'AVG(julianday(\'NOW\') - julianday(invoice.dueDate)) as averageDaysOverdue',
                ])
                .where('DATE(invoice.dueDate) < DATE(\'NOW\')')
                .andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                })
                .groupBy('ageRange')
                .orderBy('averageDaysOverdue', 'ASC');

            if (tenantId) {
                agingQuery.andWhere('invoice.tenantId = :tenantId', { tenantId });
            }

            const agingResults = await agingQuery.getRawMany();
            
            const agingAnalysis: AgingBucketDto[] = agingResults.map((row) => ({
                range: row.agerange,
                count: parseInt(row.count) || 0,
                totalValue: parseFloat(row.totalvalue) || 0,
                averageDaysOverdue: parseFloat(row.averagedaysoverdue) || 0,
            }));

            const totalOutstanding = statusBreakdown
                .filter(s => s.status === 'Overdue')
                .reduce((sum, s) => sum + s.totalValue, 0);
            
            const totalRevenue = statusBreakdown.reduce((sum, s) => sum + s.totalValue, 0);
            const collectionEfficiency = totalRevenue > 0 
                ? ((totalRevenue - totalOutstanding) / totalRevenue) * 100 
                : 100;

            return {
                statusBreakdown,
                agingAnalysis,
                totalInvoices,
                totalOutstanding,
                collectionEfficiency,
            };
        } catch (error) {
            this.logger.error(`Error getting invoice status overview: ${error}`);
            throw error;
        }
    }

    async getPaymentDistribution(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<PaymentDistributionDto> {
        try {
            const { startDate, endDate } = this.normalizeQueryParams(queryParams);

            // Since we don't have actual payment data, we'll simulate it based on invoices
            const query = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    'COUNT(invoice.id) as totalPayments',
                    'AVG(invoice.totalAmount) as averagePaymentAmount',
                ])
                .where('invoice.issueDate BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                });

            if (tenantId) {
                query.andWhere('invoice.tenantId = :tenantId', { tenantId });
            }

            const result = await query.getRawOne();
            
            const totalPayments = parseInt(result?.totalpayments) || 0;
            const averagePaymentAmount = parseFloat(result?.averagepaymentamount) || 0;

            // Simulated payment methods distribution
            const paymentMethods: PaymentMethodDto[] = [
                {
                    method: 'Credit Card',
                    count: Math.floor(totalPayments * 0.45),
                    totalValue: averagePaymentAmount * Math.floor(totalPayments * 0.45),
                    percentage: 45.0,
                    averageAmount: averagePaymentAmount * 0.9,
                },
                {
                    method: 'Bank Transfer',
                    count: Math.floor(totalPayments * 0.35),
                    totalValue: averagePaymentAmount * Math.floor(totalPayments * 0.35),
                    percentage: 35.0,
                    averageAmount: averagePaymentAmount * 1.2,
                },
                {
                    method: 'Check',
                    count: Math.floor(totalPayments * 0.15),
                    totalValue: averagePaymentAmount * Math.floor(totalPayments * 0.15),
                    percentage: 15.0,
                    averageAmount: averagePaymentAmount * 1.1,
                },
                {
                    method: 'Cash',
                    count: Math.floor(totalPayments * 0.05),
                    totalValue: averagePaymentAmount * Math.floor(totalPayments * 0.05),
                    percentage: 5.0,
                    averageAmount: averagePaymentAmount * 0.7,
                },
            ];

            // Simulated payment timing analysis
            const paymentTiming: PaymentTimingDto[] = [
                {
                    category: 'Early',
                    count: Math.floor(totalPayments * 0.25),
                    percentage: 25.0,
                    averageDaysFromDue: -5.2,
                },
                {
                    category: 'On Time',
                    count: Math.floor(totalPayments * 0.55),
                    percentage: 55.0,
                    averageDaysFromDue: 0.0,
                },
                {
                    category: 'Late',
                    count: Math.floor(totalPayments * 0.20),
                    percentage: 20.0,
                    averageDaysFromDue: 15.8,
                },
            ];

            return {
                paymentMethods,
                paymentTiming,
                totalPayments,
                averagePaymentAmount,
                popularPaymentMethod: 'Credit Card',
            };
        } catch (error) {
            this.logger.error(`Error getting payment distribution: ${error}`);
            throw error;
        }
    }

    async getDashboardAnalytics(
        queryParams: AnalyticsQueryDto,
        tenantId?: string,
    ): Promise<AnalyticsDashboardDto> {
        try {
            const [revenueTrend, tenantMetrics, invoiceStatus, paymentDistribution] = 
                await Promise.all([
                    this.getRevenueTrend(queryParams, tenantId),
                    this.getTenantMetrics(queryParams, tenantId),
                    this.getInvoiceStatusOverview(queryParams, tenantId),
                    this.getPaymentDistribution(queryParams, tenantId),
                ]);

            return {
                revenueTrend,
                tenantMetrics,
                invoiceStatus,
                paymentDistribution,
                generatedAt: new Date().toISOString(),
                queryParams,
            };
        } catch (error) {
            this.logger.error(`Error getting dashboard analytics: ${error}`);
            throw error;
        }
    }

    private normalizeQueryParams(queryParams: AnalyticsQueryDto): {
        startDate: string;
        endDate: string;
        periodType: AnalyticsPeriodType;
    } {
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        const defaultEndDate = now.toISOString().split('T')[0];

        return {
            startDate: queryParams.startDate || defaultStartDate,
            endDate: queryParams.endDate || defaultEndDate,
            periodType: queryParams.periodType || AnalyticsPeriodType.MONTHLY,
        };
    }

    private getDateTruncExpression(periodType: AnalyticsPeriodType, dateField: string): string {
        // SQLite date truncation functions
        switch (periodType) {
            case AnalyticsPeriodType.DAILY:
                return `DATE(${dateField})`;
            case AnalyticsPeriodType.WEEKLY:
                return `DATE(${dateField}, 'weekday 0', '-6 days')`;
            case AnalyticsPeriodType.MONTHLY:
                return `DATE(${dateField}, 'start of month')`;
            case AnalyticsPeriodType.QUARTERLY:
                return `DATE(${dateField}, 'start of month', 
                    CASE 
                        WHEN CAST(strftime('%m', ${dateField}) AS INTEGER) <= 3 THEN '-' || (CAST(strftime('%m', ${dateField}) AS INTEGER) - 1) || ' months'
                        WHEN CAST(strftime('%m', ${dateField}) AS INTEGER) <= 6 THEN '-' || (CAST(strftime('%m', ${dateField}) AS INTEGER) - 4) || ' months'
                        WHEN CAST(strftime('%m', ${dateField}) AS INTEGER) <= 9 THEN '-' || (CAST(strftime('%m', ${dateField}) AS INTEGER) - 7) || ' months'
                        ELSE '-' || (CAST(strftime('%m', ${dateField}) AS INTEGER) - 10) || ' months'
                    END)`;
            case AnalyticsPeriodType.YEARLY:
                return `DATE(${dateField}, 'start of year')`;
            default:
                return `DATE(${dateField}, 'start of month')`;
        }
    }
}