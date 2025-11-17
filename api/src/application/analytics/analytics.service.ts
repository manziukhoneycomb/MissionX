import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { InvoiceStatus } from '../../domain/enums/invoice-status.enum';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import { AnalyticsResponseDto } from './dto/analytics-response.dto';
import { RevenueTrendDto, TopCustomerDto } from './dto/revenue-trend.dto';
import { TenantMetricsDto } from './dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto, InvoiceStatusCountDto, AgingBracketDto } from './dto/invoice-status.dto';
import { PaymentDistributionDto } from './dto/payment-distribution.dto';
import { AnalyticsQueryDto, PeriodType } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getAnalyticsOverview(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<AnalyticsResponseDto> {
        try {
            this.logger.log(`Getting analytics overview for ${isSuperAdmin ? 'Super Admin' : 'Admin'} ${tenantId ? `(tenant: ${tenantId})` : ''}`);
            
            const { startDate, endDate } = this.getDateRange(query);
            this.validateDateRange(startDate, endDate);
            
            const [
                revenueTrends,
                tenantMetrics,
                invoiceStatusOverview,
                paymentDistribution,
                totalStats
            ] = await Promise.all([
                this.getRevenueTrends(query, tenantId, isSuperAdmin),
                this.getTenantMetrics(query, tenantId, isSuperAdmin),
                this.getInvoiceStatusOverview(query, tenantId, isSuperAdmin),
                this.getPaymentDistribution(query, tenantId, isSuperAdmin),
                this.getTotalStats(query, tenantId, isSuperAdmin),
            ]);

            this.logger.log(`Analytics overview retrieved successfully with ${totalStats.totalInvoices} invoices`);

            return {
                revenueTrends,
                tenantMetrics,
                invoiceStatusOverview,
                paymentDistribution,
                dateRange: { startDate, endDate },
                totalInvoices: totalStats.totalInvoices,
                totalRevenue: totalStats.totalRevenue,
            };
        } catch (error) {
            this.logger.error('Failed to retrieve analytics overview', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve analytics data');
        }
    }

    async getRevenueTrends(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<RevenueTrendDto[]> {
        try {
            this.logger.log(`Getting revenue trends for period: ${query.periodType || 'monthly'}`);
            
            const { startDate, endDate } = this.getDateRange(query);
            this.validateDateRange(startDate, endDate);
            const periodType = query.periodType || PeriodType.MONTHLY;
        
        const baseQuery = this.createBaseQuery(tenantId, isSuperAdmin, query.tenantId);
        baseQuery.andWhere('invoice.issueDate >= :startDate', { startDate });
        baseQuery.andWhere('invoice.issueDate <= :endDate', { endDate });

        let dateFormat: string;
        switch (periodType) {
            case PeriodType.YEARLY:
                dateFormat = '%Y';
                break;
            case PeriodType.QUARTERLY:
                dateFormat = '%Y-Q%q';
                break;
            default:
                dateFormat = '%Y-%m';
        }

        const results = await baseQuery
            .select([
                `DATE_FORMAT(invoice.issueDate, '${dateFormat}') as period`,
                'SUM(invoice.totalAmount) as totalRevenue',
                'COUNT(invoice.id) as invoiceCount',
                'AVG(invoice.totalAmount) as averageInvoiceValue',
            ])
            .groupBy('period')
            .orderBy('period', 'ASC')
            .getRawMany();

            const mappedResults = results.map(result => ({
                period: result.period,
                totalRevenue: parseFloat(result.totalRevenue || '0'),
                invoiceCount: parseInt(result.invoiceCount || '0'),
                averageInvoiceValue: parseFloat(result.averageInvoiceValue || '0'),
                periodType,
            }));

            this.logger.log(`Revenue trends retrieved: ${mappedResults.length} periods`);
            return mappedResults;
        } catch (error) {
            this.logger.error('Failed to retrieve revenue trends', error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve revenue trends');
        }
    }

    async getTenantMetrics(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TenantMetricsDto[]> {
        const { startDate, endDate } = this.getDateRange(query);
        
        const baseQuery = this.createBaseQuery(tenantId, isSuperAdmin, query.tenantId);
        baseQuery.andWhere('invoice.issueDate >= :startDate', { startDate });
        baseQuery.andWhere('invoice.issueDate <= :endDate', { endDate });

        const results = await baseQuery
            .leftJoin('invoice.tenant', 'tenant')
            .select([
                'tenant.id as tenantId',
                'tenant.name as tenantName',
                'COUNT(invoice.id) as totalInvoices',
                'SUM(invoice.totalAmount) as totalRevenue',
                'AVG(invoice.totalAmount) as averageInvoiceValue',
                `SUM(CASE WHEN invoice.dueDate < CURDATE() THEN 0 ELSE 1 END) as paidInvoices`,
                `SUM(CASE WHEN invoice.dueDate >= CURDATE() THEN 0 ELSE 1 END) as unpaidInvoices`,
                `SUM(CASE WHEN invoice.dueDate < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as overdueInvoices`,
                'AVG(DATEDIFF(CURDATE(), invoice.dueDate)) as averageDaysToPayment',
            ])
            .groupBy('tenant.id, tenant.name')
            .orderBy('totalRevenue', 'DESC')
            .limit(query.limit || 10)
            .getRawMany();

        return results.map(result => {
            const totalInvoices = parseInt(result.totalInvoices);
            const paidInvoices = parseInt(result.paidInvoices || '0');
            const unpaidInvoices = parseInt(result.unpaidInvoices || '0');
            const overdueInvoices = parseInt(result.overdueInvoices || '0');

            return {
                tenantId: result.tenantId,
                tenantName: result.tenantName,
                totalInvoices,
                totalRevenue: parseFloat(result.totalRevenue),
                averageInvoiceValue: parseFloat(result.averageInvoiceValue),
                paidInvoices,
                unpaidInvoices,
                overdueInvoices,
                averageDaysToPayment: result.averageDaysToPayment ? parseFloat(result.averageDaysToPayment) : undefined,
                paymentTimelinessPercentage: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
            };
        });
    }

    async getInvoiceStatusOverview(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<InvoiceStatusOverviewDto> {
        const { startDate, endDate } = this.getDateRange(query);
        
        const baseQuery = this.createBaseQuery(tenantId, isSuperAdmin, query.tenantId);
        baseQuery.andWhere('invoice.issueDate >= :startDate', { startDate });
        baseQuery.andWhere('invoice.issueDate <= :endDate', { endDate });

        // Get status counts
        const statusResults = await baseQuery
            .select([
                `CASE 
                    WHEN invoice.dueDate >= CURDATE() THEN 'unpaid'
                    WHEN invoice.dueDate < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 'overdue'
                    ELSE 'paid'
                END as status`,
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as totalAmount',
            ])
            .groupBy('status')
            .getRawMany();

        // Get total for percentage calculation
        const totalResult = await baseQuery
            .select([
                'COUNT(invoice.id) as totalInvoices',
                'SUM(invoice.totalAmount) as totalValue',
            ])
            .getRawOne();

        const totalInvoices = parseInt(totalResult.totalInvoices);
        const totalValue = parseFloat(totalResult.totalValue);

        const statusCounts: InvoiceStatusCountDto[] = statusResults.map(result => ({
            status: result.status as 'paid' | 'unpaid' | 'overdue',
            count: parseInt(result.count),
            totalAmount: parseFloat(result.totalAmount),
            percentage: totalInvoices > 0 ? (parseInt(result.count) / totalInvoices) * 100 : 0,
        }));

        // Get aging analysis for unpaid/overdue invoices
        const agingQuery = this.createBaseQuery(tenantId, isSuperAdmin, query.tenantId);
        agingQuery.andWhere('invoice.issueDate >= :startDate', { startDate });
        agingQuery.andWhere('invoice.issueDate <= :endDate', { endDate });
        agingQuery.andWhere('invoice.dueDate < CURDATE()'); // Only overdue invoices

        const agingResults = await agingQuery
            .select([
                `CASE 
                    WHEN DATEDIFF(CURDATE(), invoice.dueDate) <= 30 THEN '0-30'
                    WHEN DATEDIFF(CURDATE(), invoice.dueDate) <= 60 THEN '31-60'
                    WHEN DATEDIFF(CURDATE(), invoice.dueDate) <= 90 THEN '61-90'
                    ELSE '90+'
                END as range`,
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as totalAmount',
                'AVG(DATEDIFF(CURDATE(), invoice.dueDate)) as averageDaysOverdue',
            ])
            .groupBy('range')
            .getRawMany();

        const agingAnalysis: AgingBracketDto[] = agingResults.map(result => ({
            range: result.range,
            count: parseInt(result.count),
            totalAmount: parseFloat(result.totalAmount),
            averageDaysOverdue: parseFloat(result.averageDaysOverdue),
        }));

        return {
            statusCounts,
            agingAnalysis,
            totalInvoices,
            totalValue,
        };
    }

    async getPaymentDistribution(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<PaymentDistributionDto[]> {
        const { startDate, endDate } = this.getDateRange(query);
        
        const baseQuery = this.createBaseQuery(tenantId, isSuperAdmin, query.tenantId);
        baseQuery.andWhere('invoice.issueDate >= :startDate', { startDate });
        baseQuery.andWhere('invoice.issueDate <= :endDate', { endDate });

        // Since we don't have payment method information in the current schema,
        // we'll distribute by invoice amount ranges as a proxy
        const results = await baseQuery
            .select([
                `CASE 
                    WHEN invoice.totalAmount < 1000 THEN 'Small (< $1,000)'
                    WHEN invoice.totalAmount < 5000 THEN 'Medium ($1,000 - $5,000)'
                    WHEN invoice.totalAmount < 10000 THEN 'Large ($5,000 - $10,000)'
                    ELSE 'Enterprise ($10,000+)'
                END as category`,
                'SUM(invoice.totalAmount) as totalAmount',
                'COUNT(invoice.id) as count',
                'AVG(invoice.totalAmount) as averageAmount',
            ])
            .groupBy('category')
            .getRawMany();

        // Calculate total for percentages
        const totalResult = await baseQuery
            .select('SUM(invoice.totalAmount) as total')
            .getRawOne();

        const total = parseFloat(totalResult.total);

        return results.map(result => ({
            category: result.category,
            totalAmount: parseFloat(result.totalAmount),
            count: parseInt(result.count),
            percentage: total > 0 ? (parseFloat(result.totalAmount) / total) * 100 : 0,
            averageAmount: parseFloat(result.averageAmount),
        }));
    }

    async getTopCustomers(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TopCustomerDto[]> {
        const { startDate, endDate } = this.getDateRange(query);
        
        const baseQuery = this.createBaseQuery(tenantId, isSuperAdmin, query.tenantId);
        baseQuery.andWhere('invoice.issueDate >= :startDate', { startDate });
        baseQuery.andWhere('invoice.issueDate <= :endDate', { endDate });

        const results = await baseQuery
            .select([
                'invoice.customerName as customerName',
                'SUM(invoice.totalAmount) as totalRevenue',
                'COUNT(invoice.id) as invoiceCount',
            ])
            .groupBy('invoice.customerName')
            .orderBy('totalRevenue', 'DESC')
            .limit(query.limit || 10)
            .getRawMany();

        return results.map(result => ({
            customerName: result.customerName,
            totalRevenue: parseFloat(result.totalRevenue),
            invoiceCount: parseInt(result.invoiceCount),
        }));
    }

    private async getTotalStats(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<{ totalInvoices: number; totalRevenue: number }> {
        const { startDate, endDate } = this.getDateRange(query);
        
        const baseQuery = this.createBaseQuery(tenantId, isSuperAdmin, query.tenantId);
        baseQuery.andWhere('invoice.issueDate >= :startDate', { startDate });
        baseQuery.andWhere('invoice.issueDate <= :endDate', { endDate });

        const result = await baseQuery
            .select([
                'COUNT(invoice.id) as totalInvoices',
                'SUM(invoice.totalAmount) as totalRevenue',
            ])
            .getRawOne();

        return {
            totalInvoices: parseInt(result.totalInvoices || '0'),
            totalRevenue: parseFloat(result.totalRevenue || '0'),
        };
    }

    private createBaseQuery(
        tenantId?: string,
        isSuperAdmin?: boolean,
        specificTenantId?: string,
    ): SelectQueryBuilder<Invoice> {
        const query = this.invoiceRepository.createQueryBuilder('invoice');

        // Role-based filtering
        if (isSuperAdmin && specificTenantId) {
            query.andWhere('invoice.tenantId = :specificTenantId', { specificTenantId });
        } else if (!isSuperAdmin && tenantId) {
            query.andWhere('invoice.tenantId = :tenantId', { tenantId });
        } else if (!isSuperAdmin && !tenantId) {
            // Non-admin without tenant should see no data
            query.andWhere('1 = 0');
        }

        return query;
    }

    private getDateRange(query: AnalyticsQueryDto): { startDate: string; endDate: string } {
        const now = new Date();
        const defaultEndDate = now.toISOString().split('T')[0];
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
            .toISOString()
            .split('T')[0]; // 12 months ago

        return {
            startDate: query.startDate || defaultStartDate,
            endDate: query.endDate || defaultEndDate,
        };
    }

    private validateDateRange(startDate: string, endDate: string): void {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
        }

        if (start > end) {
            throw new BadRequestException('Start date must be before or equal to end date.');
        }

        if (start > now) {
            throw new BadRequestException('Start date cannot be in the future.');
        }

        // Limit date range to prevent performance issues (max 3 years)
        const maxRangeMs = 3 * 365 * 24 * 60 * 60 * 1000; // 3 years in milliseconds
        if (end.getTime() - start.getTime() > maxRangeMs) {
            throw new BadRequestException('Date range cannot exceed 3 years.');
        }
    }

    private handleQueryError(error: unknown, operation: string): never {
        this.logger.error(`Database error during ${operation}`, error);
        
        if (error instanceof BadRequestException) {
            throw error;
        }
        
        // Check for specific database errors that might be recoverable
        if (error && typeof error === 'object' && 'code' in error) {
            const dbError = error as { code: string; message?: string };
            
            switch (dbError.code) {
                case 'ER_NO_SUCH_TABLE':
                    throw new InternalServerErrorException('Database schema error: Required tables not found');
                case 'ER_TOO_MANY_ROWS':
                    throw new BadRequestException('Query returned too many results. Please use a more specific date range.');
                default:
                    this.logger.error(`Unexpected database error code: ${dbError.code}`, dbError.message);
            }
        }
        
        throw new InternalServerErrorException(`Failed to execute ${operation}`);
    }
}