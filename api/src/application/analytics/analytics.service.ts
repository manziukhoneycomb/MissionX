import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, In } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import { AnalyticsQueryDto } from './dto/analytics-response.dto';
import { RevenueTrendDto, RevenueTrendPointDto, TopCustomerDto } from './dto/revenue-trend.dto';
import { TenantPerformanceDto, TenantMetricDto } from './dto/tenant-metrics.dto';
import { 
    InvoiceStatusOverviewDto, 
    InvoiceStatusCountDto, 
    AgingBucketDto 
} from './dto/invoice-status.dto';
import { 
    PaymentDistributionDto, 
    PaymentMethodDto, 
    PaymentTimingDto 
} from './dto/payment-distribution.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);
    private readonly queryCache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getRevenueTrends(query: AnalyticsQueryDto, tenantId?: string): Promise<RevenueTrendDto> {
        const cacheKey = this.generateCacheKey('revenue-trends', query, tenantId);
        
        return this.executeWithCache(cacheKey, async () => {
            const { startDate, endDate } = query.dateRange;
            const whereClause = this.buildWhereClause(startDate, endDate, tenantId, query.tenantIds);

            const monthlyData = await this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    'DATE_TRUNC(\'month\', invoice.issueDate) as period',
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(invoice.id) as invoice_count'
                ])
                .where(whereClause.condition, whereClause.parameters)
                .groupBy('period')
                .orderBy('period', 'ASC')
                .getRawMany();

            const trendData: RevenueTrendPointDto[] = monthlyData.map(item => ({
                period: new Date(item.period).toISOString().substring(0, 7),
                revenue: parseFloat(item.revenue) || 0,
                invoiceCount: parseInt(item.invoice_count) || 0,
                date: new Date(item.period).toISOString().split('T')[0]
            }));

            const totalRevenue = trendData.reduce((sum, item) => sum + item.revenue, 0);
            const totalInvoices = trendData.reduce((sum, item) => sum + item.invoiceCount, 0);
            const averageRevenuePerPeriod = trendData.length > 0 ? totalRevenue / trendData.length : 0;

            return {
                data: trendData,
                totalRevenue,
                totalInvoices,
                averageRevenuePerPeriod,
                periodType: 'monthly'
            };
        });
    }

    async getTopCustomers(
        query: AnalyticsQueryDto, 
        tenantId?: string, 
        limit: number = 10
    ): Promise<TopCustomerDto[]> {
        const cacheKey = this.generateCacheKey('top-customers', query, tenantId, { limit });
        
        return this.executeWithCache(cacheKey, async () => {
            const { startDate, endDate } = query.dateRange;
            const whereClause = this.buildWhereClause(startDate, endDate, tenantId, query.tenantIds);

            const customerData = await this.invoiceRepository
                .createQueryBuilder('invoice')
                .select([
                    'invoice.customerName as customer_name',
                    'SUM(invoice.totalAmount) as total_revenue',
                    'COUNT(invoice.id) as invoice_count',
                    'AVG(invoice.totalAmount) as average_invoice_value'
                ])
                .where(whereClause.condition, whereClause.parameters)
                .groupBy('invoice.customerName')
                .orderBy('total_revenue', 'DESC')
                .limit(limit)
                .getRawMany();

            return customerData.map((item, index) => ({
                customerName: item.customer_name,
                totalRevenue: parseFloat(item.total_revenue) || 0,
                invoiceCount: parseInt(item.invoice_count) || 0,
                averageInvoiceValue: parseFloat(item.average_invoice_value) || 0,
                rank: index + 1
            }));
        });
    }

    async getTenantPerformance(
        query: AnalyticsQueryDto, 
        tenantId?: string
    ): Promise<TenantPerformanceDto> {
        const cacheKey = this.generateCacheKey('tenant-performance', query, tenantId);
        
        return this.executeWithCache(cacheKey, async () => {
            const { startDate, endDate } = query.dateRange;
            const whereClause = this.buildWhereClause(startDate, endDate, tenantId, query.tenantIds);

            const tenantData = await this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'invoice.tenantId as tenant_id',
                    'tenant.name as tenant_name',
                    'COUNT(invoice.id) as invoice_count',
                    'SUM(invoice.totalAmount) as total_revenue',
                    'AVG(invoice.totalAmount) as average_invoice_value',
                    'COUNT(CASE WHEN invoice.totalAmount > 0 THEN 1 END) as paid_invoices',
                    'COUNT(CASE WHEN invoice.totalAmount = 0 THEN 1 END) as unpaid_invoices',
                    'COUNT(CASE WHEN invoice.dueDate < CURRENT_DATE AND invoice.totalAmount = 0 THEN 1 END) as overdue_invoices'
                ])
                .where(whereClause.condition, whereClause.parameters)
                .groupBy('invoice.tenantId, tenant.name')
                .orderBy('total_revenue', 'DESC')
                .getRawMany();

            // Handle empty dataset gracefully
            if (!tenantData || tenantData.length === 0) {
                this.logger.warn(`No tenant data found for period ${startDate} to ${endDate}`);
                return {
                    tenants: [],
                    totalInvoices: 0,
                    totalRevenue: 0,
                    averageInvoicesPerTenant: 0,
                    topTenant: {
                        tenantId: '',
                        invoiceCount: 0,
                        totalRevenue: 0,
                        averageInvoiceValue: 0,
                        paidInvoices: 0,
                        unpaidInvoices: 0,
                        overdueInvoices: 0,
                        paymentSuccessRate: 0
                    }
                };
            }

            const tenants: TenantMetricDto[] = tenantData.map(item => {
                const invoiceCount = parseInt(item.invoice_count) || 0;
                const paidInvoices = parseInt(item.paid_invoices) || 0;
                const unpaidInvoices = parseInt(item.unpaid_invoices) || 0;
                const overdueInvoices = parseInt(item.overdue_invoices) || 0;
                
                return {
                    tenantId: item.tenant_id || '',
                    tenantName: item.tenant_name || 'Unknown Tenant',
                    invoiceCount,
                    totalRevenue: parseFloat(item.total_revenue) || 0,
                    averageInvoiceValue: parseFloat(item.average_invoice_value) || 0,
                    paidInvoices,
                    unpaidInvoices,
                    overdueInvoices,
                    paymentSuccessRate: invoiceCount > 0 ? (paidInvoices / invoiceCount) * 100 : 0
                };
            });

            const totalInvoices = tenants.reduce((sum, tenant) => sum + tenant.invoiceCount, 0);
            const totalRevenue = tenants.reduce((sum, tenant) => sum + tenant.totalRevenue, 0);
            const averageInvoicesPerTenant = tenants.length > 0 ? totalInvoices / tenants.length : 0;
            const topTenant = tenants[0] || {
                tenantId: '',
                invoiceCount: 0,
                totalRevenue: 0,
                averageInvoiceValue: 0,
                paidInvoices: 0,
                unpaidInvoices: 0,
                overdueInvoices: 0,
                paymentSuccessRate: 0
            };

            return {
                tenants,
                totalInvoices,
                totalRevenue,
                averageInvoicesPerTenant,
                topTenant
            };
        });
    }

    async getInvoiceStatusOverview(
        query: AnalyticsQueryDto, 
        tenantId?: string
    ): Promise<InvoiceStatusOverviewDto> {
        const { startDate, endDate } = query.dateRange;
        const whereClause = this.buildWhereClause(startDate, endDate, tenantId, query.tenantIds);

        // Get basic status counts (simplified - in real app you'd have a status field)
        const statusData = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'CASE WHEN invoice.totalAmount > 0 THEN \'Paid\' ELSE \'Unpaid\' END as status',
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as total_amount'
            ])
            .where(whereClause.condition, whereClause.parameters)
            .groupBy('status')
            .getRawMany();

        const totalInvoices = statusData.reduce((sum, item) => sum + parseInt(item.count), 0);
        const totalAmount = statusData.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);

        const statusCounts: InvoiceStatusCountDto[] = statusData.map(item => ({
            status: item.status,
            count: parseInt(item.count),
            totalAmount: parseFloat(item.total_amount) || 0,
            percentage: totalInvoices > 0 ? (parseInt(item.count) / totalInvoices) * 100 : 0
        }));

        // Aging analysis for unpaid invoices
        const today = new Date().toISOString().split('T')[0];
        const agingData = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'CASE ' +
                'WHEN CURRENT_DATE - invoice.dueDate <= 30 THEN \'0-30 days\' ' +
                'WHEN CURRENT_DATE - invoice.dueDate <= 60 THEN \'31-60 days\' ' +
                'WHEN CURRENT_DATE - invoice.dueDate <= 90 THEN \'61-90 days\' ' +
                'ELSE \'90+ days\' END as age_range',
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as total_amount'
            ])
            .where(whereClause.condition + ' AND invoice.totalAmount = 0', whereClause.parameters)
            .groupBy('age_range')
            .getRawMany();

        const unpaidTotal = agingData.reduce((sum, item) => sum + parseInt(item.count), 0);
        
        const agingAnalysis: AgingBucketDto[] = agingData.map(item => {
            const range = item.age_range;
            let minDays = 0, maxDays = 0;
            
            switch (range) {
                case '0-30 days': minDays = 0; maxDays = 30; break;
                case '31-60 days': minDays = 31; maxDays = 60; break;
                case '61-90 days': minDays = 61; maxDays = 90; break;
                case '90+ days': minDays = 90; maxDays = 999; break;
            }

            return {
                ageRange: range,
                minDays,
                maxDays,
                count: parseInt(item.count),
                totalAmount: parseFloat(item.total_amount) || 0,
                percentage: unpaidTotal > 0 ? (parseInt(item.count) / unpaidTotal) * 100 : 0
            };
        });

        const paidAmount = statusCounts.find(s => s.status === 'Paid')?.totalAmount || 0;
        const unpaidAmount = statusCounts.find(s => s.status === 'Unpaid')?.totalAmount || 0;
        const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

        return {
            statusCounts,
            agingAnalysis,
            totalInvoices,
            totalAmount,
            paidAmount,
            unpaidAmount,
            collectionRate
        };
    }

    async getPaymentDistribution(
        query: AnalyticsQueryDto, 
        tenantId?: string
    ): Promise<PaymentDistributionDto> {
        const { startDate, endDate } = query.dateRange;
        const whereClause = this.buildWhereClause(startDate, endDate, tenantId, query.tenantIds);

        // Since we don't have payment methods in the current schema, we'll simulate this
        // In a real application, you'd have payment records with method information
        const paidInvoicesData = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as total_amount',
                'AVG(invoice.totalAmount) as average_amount'
            ])
            .where(whereClause.condition + ' AND invoice.totalAmount > 0', whereClause.parameters)
            .getRawOne();

        const totalPayments = parseInt(paidInvoicesData?.count) || 0;
        const totalAmount = parseFloat(paidInvoicesData?.total_amount) || 0;
        const averageAmount = parseFloat(paidInvoicesData?.average_amount) || 0;

        // Simulated payment methods distribution (in real app, this would come from payment records)
        const paymentMethods: PaymentMethodDto[] = [
            {
                method: 'Credit Card',
                count: Math.floor(totalPayments * 0.45),
                totalAmount: totalAmount * 0.45,
                percentage: 45,
                averageAmount: averageAmount * 1.1
            },
            {
                method: 'Bank Transfer',
                count: Math.floor(totalPayments * 0.30),
                totalAmount: totalAmount * 0.30,
                percentage: 30,
                averageAmount: averageAmount * 0.95
            },
            {
                method: 'Check',
                count: Math.floor(totalPayments * 0.15),
                totalAmount: totalAmount * 0.15,
                percentage: 15,
                averageAmount: averageAmount * 0.8
            },
            {
                method: 'Cash',
                count: Math.floor(totalPayments * 0.10),
                totalAmount: totalAmount * 0.10,
                percentage: 10,
                averageAmount: averageAmount * 0.7
            }
        ];

        // Payment timing analysis (simulated based on due dates)
        const timingData = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'CASE ' +
                'WHEN invoice.issueDate <= invoice.dueDate - INTERVAL \'15 days\' THEN \'Early (0-15 days)\' ' +
                'WHEN invoice.issueDate <= invoice.dueDate THEN \'On Time (16-30 days)\' ' +
                'WHEN invoice.issueDate <= invoice.dueDate + INTERVAL \'15 days\' THEN \'Late (31-45 days)\' ' +
                'ELSE \'Very Late (45+ days)\' END as category',
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as total_amount'
            ])
            .where(whereClause.condition + ' AND invoice.totalAmount > 0', whereClause.parameters)
            .groupBy('category')
            .getRawMany();

        const paymentTiming: PaymentTimingDto[] = timingData.map(item => ({
            category: item.category,
            count: parseInt(item.count),
            totalAmount: parseFloat(item.total_amount) || 0,
            percentage: totalPayments > 0 ? (parseInt(item.count) / totalPayments) * 100 : 0,
            averageDays: this.getAverageDaysFromCategory(item.category)
        }));

        return {
            paymentMethods,
            paymentTiming,
            totalPayments,
            totalAmount,
            averagePaymentAmount: averageAmount,
            averageDaysToPayment: 18.5 // Simulated average
        };
    }

    private buildWhereClause(
        startDate: string, 
        endDate: string, 
        tenantId?: string, 
        tenantIds?: string[]
    ): { condition: string; parameters: any } {
        if (!startDate || !endDate) {
            throw new Error('Start date and end date are required');
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            throw new Error('Invalid date format. Expected YYYY-MM-DD');
        }

        let condition = 'invoice.issueDate BETWEEN :startDate AND :endDate';
        const parameters: any = { startDate, endDate };

        if (tenantId) {
            // Validate tenantId format (basic UUID check)
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(tenantId)) {
                this.logger.warn(`Invalid tenantId format: ${tenantId}`);
            }
            condition += ' AND invoice.tenantId = :tenantId';
            parameters.tenantId = tenantId;
        } else if (tenantIds && tenantIds.length > 0) {
            // Validate tenantIds
            const validTenantIds = tenantIds.filter(id => 
                /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)
            );
            
            if (validTenantIds.length !== tenantIds.length) {
                this.logger.warn(`Invalid tenantId formats detected in: ${tenantIds.join(', ')}`);
            }
            
            if (validTenantIds.length > 0) {
                condition += ' AND invoice.tenantId IN (:...tenantIds)';
                parameters.tenantIds = validTenantIds;
            }
        }

        return { condition, parameters };
    }

    private getAverageDaysFromCategory(category: string): number {
        switch (category) {
            case 'Early (0-15 days)': return 8;
            case 'On Time (16-30 days)': return 23;
            case 'Late (31-45 days)': return 38;
            case 'Very Late (45+ days)': return 60;
            default: return 30;
        }
    }

    private async executeWithCache<T>(
        cacheKey: string,
        queryFunction: () => Promise<T>
    ): Promise<T> {
        const cached = this.queryCache.get(cacheKey);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
            this.logger.debug(`Cache hit for key: ${cacheKey}`);
            return cached.data as T;
        }

        this.logger.debug(`Cache miss for key: ${cacheKey}, executing query`);
        const startTime = Date.now();
        
        try {
            const result = await queryFunction();
            
            // Store in cache
            this.queryCache.set(cacheKey, {
                data: result,
                timestamp: now
            });

            // Clean up old cache entries (simple cleanup)
            if (this.queryCache.size > 100) {
                this.cleanupCache();
            }

            const duration = Date.now() - startTime;
            this.logger.debug(`Query executed in ${duration}ms for key: ${cacheKey}`);
            
            return result;
        } catch (error) {
            this.logger.error(`Query failed for key ${cacheKey}:`, error);
            
            // Handle specific database errors
            if (error.code === '42P01') {
                throw new Error('Database table not found. Please ensure migrations have been run.');
            } else if (error.code === '23505') {
                throw new Error('Data integrity violation occurred.');
            } else if (error.code === '08P01') {
                throw new Error('Database connection protocol violation.');
            } else if (error.name === 'QueryFailedError') {
                throw new Error(`Database query failed: ${error.message}`);
            }
            
            throw error;
        }
    }

    private cleanupCache(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, value] of this.queryCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.queryCache.delete(key));
        this.logger.debug(`Cleaned up ${keysToDelete.length} cache entries`);
    }

    private generateCacheKey(method: string, query: AnalyticsQueryDto, tenantId?: string, extra?: any): string {
        const keyParts = [
            method,
            query.dateRange.startDate,
            query.dateRange.endDate,
            tenantId || 'all',
            query.tenantIds?.sort().join(',') || 'none',
            extra ? JSON.stringify(extra) : ''
        ];
        return keyParts.join('|');
    }
}