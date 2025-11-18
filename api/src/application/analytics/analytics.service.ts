import { Injectable, Logger, BadRequestException, CacheInterceptor, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { AnalyticsQueryDto, AnalyticsMetaSummaryDto } from './dto/analytics-response.dto';
import { 
    RevenueTrendDto, 
    RevenueTrendDataPointDto, 
    MonthlyRevenueDto, 
    QuarterlyRevenueDto 
} from './dto/revenue-trend.dto';
import { 
    TenantMetricsDto, 
    TenantMetricDto, 
    TopCustomerDto 
} from './dto/tenant-metrics.dto';
import { 
    InvoiceStatusOverviewDto, 
    InvoiceStatusCountDto, 
    InvoiceAgingDto, 
    AgingAnalysisDto,
    InvoiceStatus 
} from './dto/invoice-status.dto';
import { 
    PaymentDistributionDto, 
    PaymentMethodDto, 
    InvoiceValueDistributionDto, 
    InvoiceAmountRangeDto 
} from './dto/payment-distribution.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { AnalyticsException, AnalyticsErrorCode } from './interfaces/analytics-errors.interface';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);
    private readonly CACHE_TTL = 300; // 5 minutes cache

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    async getMetaSummary(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<AnalyticsMetaSummaryDto> {
        const cacheKey = this.getCacheKey('meta-summary', query, userRoles, userTenantId);
        
        try {
            const cached = await this.cacheManager.get<AnalyticsMetaSummaryDto>(cacheKey);
            if (cached) {
                this.logger.debug('Returning cached meta summary');
                return cached;
            }

            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .select(['invoice.id', 'invoice.totalAmount']);

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            // Use single query with aggregation for better performance
            const aggregateResult = await queryBuilder
                .select([
                    'COUNT(invoice.id) as totalInvoices',
                    'COALESCE(SUM(invoice.totalAmount), 0) as totalRevenue',
                    'COALESCE(AVG(invoice.totalAmount), 0) as averageInvoiceValue'
                ])
                .getRawOne();

            const activeTenants = await this.getActiveTenantsCount(userRoles, userTenantId);

            const result = {
                totalInvoices: parseInt(aggregateResult?.totalInvoices || '0', 10),
                totalRevenue: Math.round(parseFloat(aggregateResult?.totalRevenue || '0') * 100) / 100,
                activeTenants,
                averageInvoiceValue: Math.round(parseFloat(aggregateResult?.averageInvoiceValue || '0') * 100) / 100
            };

            await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
            return result;
        } catch (error) {
            return this.handleError(error, 'getMetaSummary', query);
        }
    }

    async getRevenueTrends(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<RevenueTrendDto> {
        try {
            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'DATE(invoice.issueDate) as date',
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(invoice.id) as invoiceCount'
                ])
                .groupBy('DATE(invoice.issueDate)')
                .orderBy('date', 'ASC');

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            const rawData = await queryBuilder.getRawMany();
            
            const data: RevenueTrendDataPointDto[] = rawData.map(item => ({
                date: item.date,
                revenue: parseFloat(item.revenue || '0'),
                invoiceCount: parseInt(item.invoiceCount || '0', 10)
            }));

            const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
            const totalInvoices = data.reduce((sum, item) => sum + item.invoiceCount, 0);
            const averageRevenuePerDay = data.length > 0 ? totalRevenue / data.length : 0;

            return {
                data,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalInvoices,
                averageRevenuePerDay: Math.round(averageRevenuePerDay * 100) / 100
            };
        } catch (error) {
            this.logger.error('Error generating revenue trends', error);
            throw new BadRequestException('Failed to generate revenue trends');
        }
    }

    async getMonthlyRevenue(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<MonthlyRevenueDto[]> {
        try {
            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'EXTRACT(YEAR FROM invoice.issueDate) as year',
                    'EXTRACT(MONTH FROM invoice.issueDate) as month',
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(invoice.id) as invoiceCount'
                ])
                .groupBy('year, month')
                .orderBy('year, month', 'ASC');

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            const rawData = await queryBuilder.getRawMany();
            
            return rawData.map(item => ({
                year: parseInt(item.year, 10),
                month: parseInt(item.month, 10),
                revenue: parseFloat(item.revenue || '0'),
                invoiceCount: parseInt(item.invoiceCount || '0', 10)
            }));
        } catch (error) {
            this.logger.error('Error generating monthly revenue', error);
            throw new BadRequestException('Failed to generate monthly revenue data');
        }
    }

    async getQuarterlyRevenue(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<QuarterlyRevenueDto[]> {
        try {
            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'EXTRACT(YEAR FROM invoice.issueDate) as year',
                    'CEIL(EXTRACT(MONTH FROM invoice.issueDate) / 3.0) as quarter',
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(invoice.id) as invoiceCount'
                ])
                .groupBy('year, quarter')
                .orderBy('year, quarter', 'ASC');

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            const rawData = await queryBuilder.getRawMany();
            
            return rawData.map(item => ({
                year: parseInt(item.year, 10),
                quarter: parseInt(item.quarter, 10),
                revenue: parseFloat(item.revenue || '0'),
                invoiceCount: parseInt(item.invoiceCount || '0', 10)
            }));
        } catch (error) {
            this.logger.error('Error generating quarterly revenue', error);
            throw new BadRequestException('Failed to generate quarterly revenue data');
        }
    }

    async getTenantMetrics(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<TenantMetricsDto> {
        try {
            const queryBuilder = this.tenantRepository
                .createQueryBuilder('tenant')
                .leftJoin('tenant.invoices', 'invoice')
                .select([
                    'tenant.id as tenantId',
                    'tenant.name as tenantName',
                    'COUNT(invoice.id) as totalInvoices',
                    'COALESCE(SUM(invoice.totalAmount), 0) as totalRevenue',
                    'COALESCE(AVG(invoice.totalAmount), 0) as averageInvoiceValue',
                    `COALESCE(SUM(CASE 
                        WHEN invoice.dueDate >= CURRENT_DATE OR invoice.dueDate IS NULL 
                        THEN 1 ELSE 0 END), 0) as paidInvoices`,
                    `COALESCE(SUM(CASE 
                        WHEN invoice.dueDate < CURRENT_DATE 
                        THEN 1 ELSE 0 END), 0) as overdueInvoices`
                ])
                .groupBy('tenant.id, tenant.name')
                .orderBy('totalRevenue', 'DESC');

            if (!userRoles.includes(RoleName.SUPER_ADMIN) && userTenantId) {
                queryBuilder.where('tenant.id = :tenantId', { tenantId: userTenantId });
            }

            if (query.startDate) {
                queryBuilder.andWhere('invoice.issueDate >= :startDate', { startDate: query.startDate });
            }

            if (query.endDate) {
                queryBuilder.andWhere('invoice.issueDate <= :endDate', { endDate: query.endDate });
            }

            const rawData = await queryBuilder.getRawMany();
            
            const tenantMetrics: TenantMetricDto[] = rawData.map(item => {
                const totalInvoices = parseInt(item.totalInvoices || '0', 10);
                const paidInvoices = parseInt(item.paidInvoices || '0', 10);
                const overdueInvoices = parseInt(item.overdueInvoices || '0', 10);
                const unpaidInvoices = totalInvoices - paidInvoices;
                
                return {
                    tenantId: item.tenantId,
                    tenantName: item.tenantName,
                    totalInvoices,
                    totalRevenue: parseFloat(item.totalRevenue || '0'),
                    averageInvoiceValue: parseFloat(item.averageInvoiceValue || '0'),
                    paidInvoices,
                    unpaidInvoices,
                    overdueInvoices,
                    paymentTimelinessPercentage: totalInvoices > 0 
                        ? Math.round((paidInvoices / totalInvoices) * 100) 
                        : 0
                };
            });

            const totalTenants = await this.tenantRepository.count();
            const activeTenants = tenantMetrics.filter(t => t.totalInvoices > 0).length;

            const topTenantByRevenue = tenantMetrics.length > 0 
                ? tenantMetrics.reduce((prev, current) => 
                    prev.totalRevenue > current.totalRevenue ? prev : current) 
                : undefined;

            const topTenantByInvoiceCount = tenantMetrics.length > 0 
                ? tenantMetrics.reduce((prev, current) => 
                    prev.totalInvoices > current.totalInvoices ? prev : current) 
                : undefined;

            return {
                tenantMetrics,
                totalTenants,
                activeTenants,
                topTenantByRevenue,
                topTenantByInvoiceCount
            };
        } catch (error) {
            this.logger.error('Error generating tenant metrics', error);
            throw new BadRequestException('Failed to generate tenant metrics');
        }
    }

    async getTopCustomers(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<TopCustomerDto[]> {
        try {
            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'invoice.customerName as customerName',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'COUNT(invoice.id) as invoiceCount',
                    'AVG(invoice.totalAmount) as averageInvoiceValue'
                ])
                .groupBy('invoice.customerName')
                .orderBy('totalRevenue', 'DESC')
                .limit(query.limit || 10);

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            const rawData = await queryBuilder.getRawMany();
            
            const totalRevenue = await this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select('SUM(invoice.totalAmount)', 'totalRevenue')
                .where(userRoles.includes(RoleName.SUPER_ADMIN) 
                    ? '1=1' 
                    : 'invoice.tenantId = :tenantId', 
                    userRoles.includes(RoleName.SUPER_ADMIN) ? {} : { tenantId: userTenantId })
                .getRawOne()
                .then(result => parseFloat(result?.totalRevenue || '0'));

            return rawData.map(item => ({
                customerName: item.customerName,
                totalRevenue: parseFloat(item.totalRevenue || '0'),
                invoiceCount: parseInt(item.invoiceCount || '0', 10),
                averageInvoiceValue: parseFloat(item.averageInvoiceValue || '0'),
                revenuePercentage: totalRevenue > 0 
                    ? Math.round((parseFloat(item.totalRevenue || '0') / totalRevenue) * 100 * 100) / 100
                    : 0
            }));
        } catch (error) {
            this.logger.error('Error generating top customers', error);
            throw new BadRequestException('Failed to generate top customers data');
        }
    }

    async getInvoiceStatusOverview(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<InvoiceStatusOverviewDto> {
        try {
            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    `CASE 
                        WHEN invoice.dueDate >= CURRENT_DATE OR invoice.dueDate IS NULL THEN 'paid'
                        WHEN invoice.dueDate < CURRENT_DATE THEN 'overdue'
                        ELSE 'unpaid'
                    END as status`,
                    'COUNT(invoice.id) as count',
                    'SUM(invoice.totalAmount) as totalAmount'
                ])
                .groupBy('status');

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            const rawData = await queryBuilder.getRawMany();
            const totalInvoices = rawData.reduce((sum, item) => sum + parseInt(item.count || '0', 10), 0);
            const totalAmount = rawData.reduce((sum, item) => sum + parseFloat(item.totalAmount || '0'), 0);

            const statusBreakdown: InvoiceStatusCountDto[] = rawData.map(item => ({
                status: item.status as InvoiceStatus,
                count: parseInt(item.count || '0', 10),
                totalAmount: parseFloat(item.totalAmount || '0'),
                percentage: totalInvoices > 0 
                    ? Math.round((parseInt(item.count || '0', 10) / totalInvoices) * 100 * 100) / 100
                    : 0
            }));

            const paidCount = statusBreakdown.find(s => s.status === InvoiceStatus.PAID)?.count || 0;
            const collectionRate = totalInvoices > 0 
                ? Math.round((paidCount / totalInvoices) * 100 * 100) / 100
                : 0;

            return {
                statusBreakdown,
                totalInvoices,
                totalAmount: Math.round(totalAmount * 100) / 100,
                collectionRate
            };
        } catch (error) {
            this.logger.error('Error generating invoice status overview', error);
            throw new BadRequestException('Failed to generate invoice status overview');
        }
    }

    async getInvoiceAging(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<InvoiceAgingDto> {
        try {
            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    `CASE 
                        WHEN CURRENT_DATE - invoice.dueDate <= 30 THEN '0-30 days'
                        WHEN CURRENT_DATE - invoice.dueDate <= 60 THEN '31-60 days'
                        WHEN CURRENT_DATE - invoice.dueDate <= 90 THEN '61-90 days'
                        ELSE '90+ days'
                    END as ageRange`,
                    'COUNT(invoice.id) as count',
                    'SUM(invoice.totalAmount) as totalAmount',
                    'MAX(CURRENT_DATE - invoice.dueDate) as oldestDays',
                    'AVG(CURRENT_DATE - invoice.dueDate) as avgDays'
                ])
                .where('invoice.dueDate < CURRENT_DATE')
                .groupBy('ageRange');

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            const rawData = await queryBuilder.getRawMany();
            const totalUnpaidAmount = rawData.reduce((sum, item) => sum + parseFloat(item.totalAmount || '0'), 0);

            const agingBreakdown: AgingAnalysisDto[] = rawData.map(item => ({
                ageRange: item.ageRange,
                count: parseInt(item.count || '0', 10),
                totalAmount: parseFloat(item.totalAmount || '0'),
                percentage: totalUnpaidAmount > 0 
                    ? Math.round((parseFloat(item.totalAmount || '0') / totalUnpaidAmount) * 100 * 100) / 100
                    : 0
            }));

            const averageDaysOutstanding = rawData.length > 0 
                ? Math.round(rawData.reduce((sum, item) => sum + parseFloat(item.avgDays || '0'), 0) / rawData.length)
                : 0;

            const oldestUnpaidDays = rawData.length > 0 
                ? Math.max(...rawData.map(item => parseInt(item.oldestDays || '0', 10)))
                : 0;

            return {
                agingBreakdown,
                totalUnpaidAmount: Math.round(totalUnpaidAmount * 100) / 100,
                averageDaysOutstanding,
                oldestUnpaidDays
            };
        } catch (error) {
            this.logger.error('Error generating invoice aging analysis', error);
            throw new BadRequestException('Failed to generate invoice aging analysis');
        }
    }

    async getInvoiceValueDistribution(
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): Promise<InvoiceValueDistributionDto> {
        try {
            const queryBuilder = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    `CASE 
                        WHEN invoice.totalAmount <= 1000 THEN '$0-$1,000'
                        WHEN invoice.totalAmount <= 5000 THEN '$1,001-$5,000'
                        WHEN invoice.totalAmount <= 10000 THEN '$5,001-$10,000'
                        WHEN invoice.totalAmount <= 25000 THEN '$10,001-$25,000'
                        ELSE '$25,000+'
                    END as range`,
                    'COUNT(invoice.id) as count',
                    'SUM(invoice.totalAmount) as totalAmount'
                ])
                .groupBy('range')
                .orderBy('MIN(invoice.totalAmount)', 'ASC');

            this.applyFilters(queryBuilder, query, userRoles, userTenantId);

            const rawData = await queryBuilder.getRawMany();
            const totalInvoices = rawData.reduce((sum, item) => sum + parseInt(item.count || '0', 10), 0);
            const totalValue = rawData.reduce((sum, item) => sum + parseFloat(item.totalAmount || '0'), 0);

            const valueRanges: InvoiceAmountRangeDto[] = rawData.map(item => ({
                range: item.range,
                count: parseInt(item.count || '0', 10),
                totalAmount: parseFloat(item.totalAmount || '0'),
                percentage: totalInvoices > 0 
                    ? Math.round((parseInt(item.count || '0', 10) / totalInvoices) * 100 * 100) / 100
                    : 0
            }));

            // Get additional statistics
            const statsQuery = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select([
                    'AVG(invoice.totalAmount) as averageValue',
                    'MAX(invoice.totalAmount) as highestValue',
                    'MIN(invoice.totalAmount) as lowestValue'
                ]);

            this.applyFilters(statsQuery, query, userRoles, userTenantId);
            const stats = await statsQuery.getRawOne();

            // Calculate median (simplified approach)
            const medianQuery = this.invoiceRepository
                .createQueryBuilder('invoice')
                .leftJoin('invoice.tenant', 'tenant')
                .select('invoice.totalAmount', 'value')
                .orderBy('invoice.totalAmount', 'ASC');

            this.applyFilters(medianQuery, query, userRoles, userTenantId);
            const allValues = await medianQuery.getRawMany();
            const medianIndex = Math.floor(allValues.length / 2);
            const medianValue = allValues.length > 0 
                ? allValues.length % 2 === 0
                    ? (parseFloat(allValues[medianIndex - 1]?.value || '0') + parseFloat(allValues[medianIndex]?.value || '0')) / 2
                    : parseFloat(allValues[medianIndex]?.value || '0')
                : 0;

            return {
                valueRanges,
                totalInvoices,
                totalValue: Math.round(totalValue * 100) / 100,
                medianValue: Math.round(medianValue * 100) / 100,
                averageValue: Math.round(parseFloat(stats?.averageValue || '0') * 100) / 100,
                highestValue: parseFloat(stats?.highestValue || '0'),
                lowestValue: parseFloat(stats?.lowestValue || '0')
            };
        } catch (error) {
            this.logger.error('Error generating invoice value distribution', error);
            throw new BadRequestException('Failed to generate invoice value distribution');
        }
    }

    private applyFilters(
        queryBuilder: any,
        query: AnalyticsQueryDto,
        userRoles: RoleName[],
        userTenantId?: string
    ): void {
        // Apply role-based filtering
        if (!userRoles.includes(RoleName.SUPER_ADMIN) && userTenantId) {
            queryBuilder.andWhere('invoice.tenantId = :userTenantId', { userTenantId });
        }

        // Apply specific tenant filter if provided
        if (query.tenantId) {
            queryBuilder.andWhere('invoice.tenantId = :tenantId', { tenantId: query.tenantId });
        }

        // Apply date filters
        if (query.startDate) {
            queryBuilder.andWhere('invoice.issueDate >= :startDate', { startDate: query.startDate });
        }

        if (query.endDate) {
            queryBuilder.andWhere('invoice.issueDate <= :endDate', { endDate: query.endDate });
        }
    }

    private getCacheKey(
        operation: string, 
        query: AnalyticsQueryDto, 
        userRoles: RoleName[], 
        userTenantId?: string
    ): string {
        const roleKey = userRoles.includes(RoleName.SUPER_ADMIN) ? 'super_admin' : 'admin';
        const tenantKey = userTenantId || 'all';
        const queryKey = JSON.stringify({
            startDate: query.startDate,
            endDate: query.endDate,
            tenantId: query.tenantId,
            limit: query.limit,
            page: query.page
        });
        
        return `analytics:${operation}:${roleKey}:${tenantKey}:${Buffer.from(queryKey).toString('base64')}`;
    }

    private async getActiveTenantsCount(userRoles: RoleName[], userTenantId?: string): Promise<number> {
        const cacheKey = `active_tenants:${userRoles.includes(RoleName.SUPER_ADMIN) ? 'all' : userTenantId}`;
        
        const cached = await this.cacheManager.get<number>(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        const queryBuilder = this.tenantRepository
            .createQueryBuilder('tenant')
            .innerJoin('tenant.invoices', 'invoice')
            .select('COUNT(DISTINCT tenant.id)', 'count');

        if (!userRoles.includes(RoleName.SUPER_ADMIN) && userTenantId) {
            queryBuilder.where('tenant.id = :tenantId', { tenantId: userTenantId });
        }

        const result = await queryBuilder.getRawOne();
        const count = parseInt(result?.count || '0', 10);
        
        await this.cacheManager.set(cacheKey, count, this.CACHE_TTL);
        return count;
    }

    private logQueryPerformance(operation: string, startTime: number): void {
        const duration = Date.now() - startTime;
        if (duration > 1000) { // Log queries taking more than 1 second
            this.logger.warn(`Slow query detected: ${operation} took ${duration}ms`);
        } else {
            this.logger.debug(`Query ${operation} completed in ${duration}ms`);
        }
    }

    private handleError(error: any, operation: string, context?: any): never {
        this.logger.error(`Error in ${operation}`, {
            error: error.message || error,
            stack: error.stack,
            context
        });

        if (error instanceof AnalyticsException) {
            throw error;
        }

        // Map common database errors to analytics exceptions
        if (error.name === 'QueryFailedError') {
            throw new AnalyticsException(
                AnalyticsErrorCode.DATABASE_QUERY_ERROR,
                'Database query failed',
                { originalError: error.message }
            );
        }

        // Map cache errors
        if (error.message?.includes('cache') || error.message?.includes('Cache')) {
            throw new AnalyticsException(
                AnalyticsErrorCode.CACHE_ERROR,
                'Cache operation failed',
                { originalError: error.message }
            );
        }

        // Generic analytics error
        throw new AnalyticsException(
            AnalyticsErrorCode.DATABASE_QUERY_ERROR,
            `Failed to execute ${operation}`,
            { originalError: error.message }
        );
    }

    private validateQueryParameters(query: AnalyticsQueryDto): void {
        if (query.startDate && query.endDate) {
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new AnalyticsException(
                    AnalyticsErrorCode.INVALID_DATE_RANGE,
                    'Invalid date format provided'
                );
            }

            if (startDate > endDate) {
                throw new AnalyticsException(
                    AnalyticsErrorCode.INVALID_DATE_RANGE,
                    'Start date cannot be later than end date'
                );
            }

            // Check for reasonable date range (not more than 5 years)
            const maxDays = 365 * 5;
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > maxDays) {
                throw new AnalyticsException(
                    AnalyticsErrorCode.INVALID_DATE_RANGE,
                    'Date range cannot exceed 5 years'
                );
            }
        }

        if (query.limit && (query.limit < 1 || query.limit > 100)) {
            throw new AnalyticsException(
                AnalyticsErrorCode.INVALID_PARAMETERS,
                'Limit must be between 1 and 100'
            );
        }

        if (query.page && query.page < 1) {
            throw new AnalyticsException(
                AnalyticsErrorCode.INVALID_PARAMETERS,
                'Page must be greater than 0'
            );
        }
    }

    private validateUserAccess(userRoles: RoleName[], userTenantId?: string): void {
        if (!userRoles.includes(RoleName.ADMIN) && !userRoles.includes(RoleName.SUPER_ADMIN)) {
            throw new AnalyticsException(
                AnalyticsErrorCode.INSUFFICIENT_PERMISSIONS,
                'User does not have required permissions for analytics access'
            );
        }

        if (!userRoles.includes(RoleName.SUPER_ADMIN) && !userTenantId) {
            throw new AnalyticsException(
                AnalyticsErrorCode.INSUFFICIENT_PERMISSIONS,
                'Tenant ID is required for non-super admin users'
            );
        }
    }
}