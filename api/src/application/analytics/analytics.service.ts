import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import { AnalyticsSummaryDto, AnalyticsQueryDto } from './dto/analytics-response.dto';
import { RevenueTrendDto, RevenueTrendDataPointDto } from './dto/revenue-trend.dto';
import { 
    TenantMetricsDto, 
    TenantMetricsDataPointDto 
} from './dto/tenant-metrics.dto';
import { 
    InvoiceStatusOverviewDto, 
    InvoiceStatusCountDto, 
    AgingAnalysisDto 
} from './dto/invoice-status.dto';
import { 
    PaymentDistributionDto, 
    PaymentMethodDistributionDto,
    PaymentTimingDistributionDto,
    PaymentAmountRangeDto 
} from './dto/payment-distribution.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getAnalyticsSummary(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<AnalyticsSummaryDto> {
        try {
            this.logger.log('Generating analytics summary');
            
            const queryBuilder = this.buildBaseQuery(query, userTenantId, isSuperAdmin);
            
            // Get basic counts and sums
            const summaryResult = await queryBuilder
                .select([
                    'COUNT(*) as totalInvoices',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'AVG(invoice.totalAmount) as averageInvoiceValue',
                    'COUNT(DISTINCT invoice.tenantId) as uniqueTenants',
                ])
                .getRawOne();

            // Get status counts
            const currentDate = new Date();
            const paidInvoices = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.dueDate <= :currentDate', { currentDate })
                .getCount();

            const unpaidInvoices = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.dueDate > :currentDate', { currentDate })
                .getCount();

            const overdueInvoices = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.dueDate < :currentDate', { currentDate })
                .getCount();

            return {
                totalInvoices: parseInt(summaryResult.totalInvoices) || 0,
                totalRevenue: parseFloat(summaryResult.totalRevenue) || 0,
                averageInvoiceValue: parseFloat(summaryResult.averageInvoiceValue) || 0,
                uniqueTenants: parseInt(summaryResult.uniqueTenants) || 0,
                paidInvoices: paidInvoices || 0,
                unpaidInvoices: unpaidInvoices || 0,
                overdueInvoices: overdueInvoices || 0,
            };
        } catch (error) {
            this.logger.error('Error generating analytics summary', error);
            return this.handleServiceError(error, 'Failed to generate analytics summary');
        }
    }

    async getRevenueTrend(
        query: AnalyticsQueryDto,
        period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<RevenueTrendDto> {
        try {
            this.logger.log(`Generating revenue trend for period: ${period}`);
            
            const queryBuilder = this.buildBaseQuery(query, userTenantId, isSuperAdmin);
            
            // Build date formatting based on period
            const dateFormat = this.getDateFormat(period);
            const dateGroupBy = this.getDateGroupBy(period);
            
            const trendData = await queryBuilder
                .select([
                    `${dateFormat} as date`,
                    'SUM(invoice.totalAmount) as revenue',
                    'COUNT(*) as invoiceCount',
                    'AVG(invoice.totalAmount) as averageValue',
                ])
                .groupBy(dateGroupBy)
                .orderBy(dateGroupBy, 'ASC')
                .getRawMany();

            const dataPoints: RevenueTrendDataPointDto[] = trendData.map(item => ({
                date: item.date,
                revenue: parseFloat(item.revenue) || 0,
                invoiceCount: parseInt(item.invoiceCount) || 0,
                averageValue: parseFloat(item.averageValue) || 0,
            }));

            const totalRevenue = dataPoints.reduce((sum, point) => sum + point.revenue, 0);
            
            // Calculate growth rate (simplified - comparing first and last periods)
            const growthRate = this.calculateGrowthRate(dataPoints);

            return {
                dataPoints,
                period,
                totalRevenue,
                growthRate,
            };
        } catch (error) {
            this.logger.error('Error generating revenue trend', error);
            return this.handleServiceError(error, 'Failed to generate revenue trend');
        }
    }

    async getTenantMetrics(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<TenantMetricsDto> {
        try {
            this.logger.log('Generating tenant metrics');
            
            const queryBuilder = this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .leftJoin('invoice.tenant', 'tenant');

            const tenantData = await queryBuilder
                .select([
                    'invoice.tenantId as tenantId',
                    'tenant.name as tenantName',
                    'COUNT(*) as invoiceCount',
                    'SUM(invoice.totalAmount) as totalRevenue',
                    'AVG(invoice.totalAmount) as averageInvoiceValue',
                ])
                .groupBy('invoice.tenantId, tenant.name')
                .orderBy('SUM(invoice.totalAmount)', 'DESC')
                .getRawMany();

            const currentDate = new Date();
            
            // Calculate payment metrics for each tenant
            const tenantMetrics: TenantMetricsDataPointDto[] = await Promise.all(
                tenantData.map(async (tenant) => {
                    const paidInvoices = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                        .andWhere('invoice.tenantId = :tenantId', { tenantId: tenant.tenantId })
                        .andWhere('invoice.dueDate <= :currentDate', { currentDate })
                        .getCount();

                    const unpaidInvoices = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                        .andWhere('invoice.tenantId = :tenantId', { tenantId: tenant.tenantId })
                        .andWhere('invoice.dueDate > :currentDate', { currentDate })
                        .getCount();

                    const overdueInvoices = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                        .andWhere('invoice.tenantId = :tenantId', { tenantId: tenant.tenantId })
                        .andWhere('invoice.dueDate < :currentDate', { currentDate })
                        .getCount();

                    const totalInvoices = parseInt(tenant.invoiceCount);
                    const paymentTimeliness = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
                    
                    // Simplified average days to payment calculation
                    const averageDaysToPayment = this.calculateAverageDaysToPayment(15); // Mock for now

                    return {
                        tenantId: tenant.tenantId,
                        tenantName: tenant.tenantName || 'Unknown Tenant',
                        invoiceCount: totalInvoices,
                        totalRevenue: parseFloat(tenant.totalRevenue) || 0,
                        averageInvoiceValue: parseFloat(tenant.averageInvoiceValue) || 0,
                        paidInvoices,
                        unpaidInvoices,
                        overdueInvoices,
                        paymentTimeliness: Math.round(paymentTimeliness * 10) / 10,
                        averageDaysToPayment,
                    };
                })
            );

            const totalTenants = tenantMetrics.length;
            const topTenant = tenantMetrics[0] || {
                tenantId: '',
                tenantName: 'No Data',
                invoiceCount: 0,
                totalRevenue: 0,
                averageInvoiceValue: 0,
                paidInvoices: 0,
                unpaidInvoices: 0,
                overdueInvoices: 0,
                paymentTimeliness: 0,
                averageDaysToPayment: 0,
            };

            const averageInvoicesPerTenant = totalTenants > 0 
                ? tenantMetrics.reduce((sum, t) => sum + t.invoiceCount, 0) / totalTenants 
                : 0;

            return {
                tenantMetrics,
                totalTenants,
                topTenant,
                averageInvoicesPerTenant: Math.round(averageInvoicesPerTenant * 10) / 10,
            };
        } catch (error) {
            this.logger.error('Error generating tenant metrics', error);
            return this.handleServiceError(error, 'Failed to generate tenant metrics');
        }
    }

    async getInvoiceStatusOverview(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<InvoiceStatusOverviewDto> {
        try {
            this.logger.log('Generating invoice status overview');
            
            const currentDate = new Date();
            const totalInvoicesResult = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .select('COUNT(*) as count, SUM(invoice.totalAmount) as total')
                .getRawOne();
            
            const totalInvoices = parseInt(totalInvoicesResult.count) || 0;
            const totalAmount = parseFloat(totalInvoicesResult.total) || 0;

            // Status counts
            const statusCounts: InvoiceStatusCountDto[] = [];
            
            const paidResult = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.dueDate <= :currentDate', { currentDate })
                .select('COUNT(*) as count, SUM(invoice.totalAmount) as total')
                .getRawOne();
            
            statusCounts.push({
                status: 'paid',
                count: parseInt(paidResult.count) || 0,
                totalAmount: parseFloat(paidResult.total) || 0,
                percentage: totalInvoices > 0 ? ((parseInt(paidResult.count) || 0) / totalInvoices) * 100 : 0,
            });

            const unpaidResult = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.dueDate > :currentDate', { currentDate })
                .select('COUNT(*) as count, SUM(invoice.totalAmount) as total')
                .getRawOne();
            
            statusCounts.push({
                status: 'unpaid',
                count: parseInt(unpaidResult.count) || 0,
                totalAmount: parseFloat(unpaidResult.total) || 0,
                percentage: totalInvoices > 0 ? ((parseInt(unpaidResult.count) || 0) / totalInvoices) * 100 : 0,
            });

            const overdueResult = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.dueDate < :currentDate', { currentDate })
                .select('COUNT(*) as count, SUM(invoice.totalAmount) as total')
                .getRawOne();
            
            statusCounts.push({
                status: 'overdue',
                count: parseInt(overdueResult.count) || 0,
                totalAmount: parseFloat(overdueResult.total) || 0,
                percentage: totalInvoices > 0 ? ((parseInt(overdueResult.count) || 0) / totalInvoices) * 100 : 0,
            });

            // Aging analysis
            const agingAnalysis: AgingAnalysisDto[] = await this.generateAgingAnalysis(query, userTenantId, isSuperAdmin);

            const totalOutstanding = statusCounts
                .filter(s => s.status === 'unpaid' || s.status === 'overdue')
                .reduce((sum, s) => sum + s.totalAmount, 0);

            const collectionRate = totalAmount > 0 
                ? ((totalAmount - totalOutstanding) / totalAmount) * 100 
                : 0;

            return {
                statusCounts,
                agingAnalysis,
                totalInvoices,
                totalOutstanding,
                collectionRate: Math.round(collectionRate * 10) / 10,
            };
        } catch (error) {
            this.logger.error('Error generating invoice status overview', error);
            this.handleServiceError(error, 'Failed to generate invoice status overview');
        }
    }

    async getPaymentDistribution(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<PaymentDistributionDto> {
        try {
            this.logger.log('Generating payment distribution');
            
            // For now, we'll create mock payment distribution data since payment method
            // and timing information is not available in the current invoice entity
            
            const totalResult = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .select('COUNT(*) as count, SUM(invoice.totalAmount) as total')
                .getRawOne();
            
            const totalPayments = parseInt(totalResult.count) || 0;
            const totalAmount = parseFloat(totalResult.total) || 0;

            // Mock payment method distribution (in a real implementation, this would come from payment data)
            const methodDistribution: PaymentMethodDistributionDto[] = [
                {
                    method: 'bank_transfer',
                    count: Math.floor(totalPayments * 0.45),
                    totalAmount: totalAmount * 0.45,
                    percentage: 45,
                },
                {
                    method: 'credit_card',
                    count: Math.floor(totalPayments * 0.30),
                    totalAmount: totalAmount * 0.30,
                    percentage: 30,
                },
                {
                    method: 'check',
                    count: Math.floor(totalPayments * 0.20),
                    totalAmount: totalAmount * 0.20,
                    percentage: 20,
                },
                {
                    method: 'cash',
                    count: Math.floor(totalPayments * 0.05),
                    totalAmount: totalAmount * 0.05,
                    percentage: 5,
                },
            ];

            // Mock payment timing distribution
            const timingDistribution: PaymentTimingDistributionDto[] = [
                {
                    timing: 'early',
                    count: Math.floor(totalPayments * 0.15),
                    totalAmount: totalAmount * 0.15,
                    percentage: 15,
                    averageDaysFromDue: -5.2,
                },
                {
                    timing: 'on_time',
                    count: Math.floor(totalPayments * 0.60),
                    totalAmount: totalAmount * 0.60,
                    percentage: 60,
                    averageDaysFromDue: 0.5,
                },
                {
                    timing: 'late',
                    count: Math.floor(totalPayments * 0.20),
                    totalAmount: totalAmount * 0.20,
                    percentage: 20,
                    averageDaysFromDue: 8.3,
                },
                {
                    timing: 'very_late',
                    count: Math.floor(totalPayments * 0.05),
                    totalAmount: totalAmount * 0.05,
                    percentage: 5,
                    averageDaysFromDue: 25.7,
                },
            ];

            // Generate amount range distribution based on actual data
            const amountRangeDistribution: PaymentAmountRangeDto[] = await this.generateAmountRangeDistribution(
                query, 
                userTenantId, 
                isSuperAdmin,
                totalPayments,
                totalAmount
            );

            return {
                methodDistribution,
                timingDistribution,
                amountRangeDistribution,
                totalPayments,
                totalAmount,
            };
        } catch (error) {
            this.logger.error('Error generating payment distribution', error);
            this.handleServiceError(error, 'Failed to generate payment distribution');
        }
    }

    private buildBaseQuery(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): SelectQueryBuilder<Invoice> {
        let queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');

        // Apply date filters
        if (query.startDate) {
            queryBuilder = queryBuilder.andWhere('invoice.issueDate >= :startDate', { 
                startDate: query.startDate 
            });
        }

        if (query.endDate) {
            queryBuilder = queryBuilder.andWhere('invoice.issueDate <= :endDate', { 
                endDate: query.endDate 
            });
        }

        // Apply tenant filtering based on user role
        if (!isSuperAdmin && userTenantId) {
            // Non-super-admin users can only see their tenant's data
            queryBuilder = queryBuilder.andWhere('invoice.tenantId = :userTenantId', { 
                userTenantId 
            });
        } else if (query.tenantId) {
            // Super admin can filter by specific tenant
            queryBuilder = queryBuilder.andWhere('invoice.tenantId = :tenantId', { 
                tenantId: query.tenantId 
            });
        }

        return queryBuilder;
    }

    private getDateFormat(period: 'daily' | 'weekly' | 'monthly' | 'quarterly'): string {
        switch (period) {
            case 'daily':
                return 'DATE(invoice.issueDate)';
            case 'weekly':
                return "DATE_FORMAT(invoice.issueDate, '%Y-%u')";
            case 'monthly':
                return "DATE_FORMAT(invoice.issueDate, '%Y-%m')";
            case 'quarterly':
                return "CONCAT(YEAR(invoice.issueDate), '-Q', QUARTER(invoice.issueDate))";
            default:
                return 'DATE(invoice.issueDate)';
        }
    }

    private getDateGroupBy(period: 'daily' | 'weekly' | 'monthly' | 'quarterly'): string {
        return this.getDateFormat(period);
    }

    private calculateGrowthRate(dataPoints: RevenueTrendDataPointDto[]): number {
        if (dataPoints.length < 2) return 0;
        
        const firstRevenue = dataPoints[0].revenue;
        const lastRevenue = dataPoints[dataPoints.length - 1].revenue;
        
        if (firstRevenue === 0) return 0;
        
        return Math.round(((lastRevenue - firstRevenue) / firstRevenue) * 100 * 10) / 10;
    }

    private calculateAverageDaysToPayment(mockValue: number): number {
        // This would be calculated from actual payment data in a real implementation
        return mockValue;
    }

    private async generateAgingAnalysis(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
    ): Promise<AgingAnalysisDto[]> {
        const currentDate = new Date();
        const agingBrackets = [
            { bracket: '0-30', min: 0, max: 30 },
            { bracket: '31-60', min: 31, max: 60 },
            { bracket: '61-90', min: 61, max: 90 },
            { bracket: '90+', min: 91, max: 999999 },
        ];

        const agingAnalysis: AgingAnalysisDto[] = [];
        let totalOutstandingAmount = 0;

        // First, calculate total outstanding amount
        const totalOutstandingResult = await this.buildBaseQuery(query, userTenantId, isSuperAdmin)
            .andWhere('invoice.dueDate < :currentDate', { currentDate })
            .select('SUM(invoice.totalAmount) as total')
            .getRawOne();
        
        totalOutstandingAmount = parseFloat(totalOutstandingResult.total) || 0;

        for (const bracket of agingBrackets) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - bracket.max);
            
            const endDate = bracket.min === 0 ? currentDate : new Date();
            endDate.setDate(endDate.getDate() - bracket.min);

            let bracketQuery = this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.dueDate < :currentDate', { currentDate });

            if (bracket.max < 999999) {
                bracketQuery = bracketQuery.andWhere('invoice.dueDate >= :startDate', { startDate });
            }
            if (bracket.min > 0) {
                bracketQuery = bracketQuery.andWhere('invoice.dueDate <= :endDate', { endDate });
            }

            const result = await bracketQuery
                .select('COUNT(*) as count, SUM(invoice.totalAmount) as total')
                .getRawOne();

            const count = parseInt(result.count) || 0;
            const totalAmount = parseFloat(result.total) || 0;
            const percentage = totalOutstandingAmount > 0 
                ? (totalAmount / totalOutstandingAmount) * 100 
                : 0;

            agingAnalysis.push({
                agingBracket: bracket.bracket,
                count,
                totalAmount,
                percentage: Math.round(percentage * 10) / 10,
            });
        }

        return agingAnalysis;
    }

    private async generateAmountRangeDistribution(
        query: AnalyticsQueryDto,
        userTenantId?: string,
        isSuperAdmin?: boolean,
        totalPayments: number,
        totalAmount: number,
    ): Promise<PaymentAmountRangeDto[]> {
        const ranges = [
            { range: '$0 - $500', minAmount: 0, maxAmount: 500 },
            { range: '$500 - $1,000', minAmount: 500, maxAmount: 1000 },
            { range: '$1,000 - $5,000', minAmount: 1000, maxAmount: 5000 },
            { range: '$5,000 - $10,000', minAmount: 5000, maxAmount: 10000 },
            { range: '$10,000+', minAmount: 10000, maxAmount: 999999999 },
        ];

        const distribution: PaymentAmountRangeDto[] = [];

        for (const range of ranges) {
            let rangeQuery = this.buildBaseQuery(query, userTenantId, isSuperAdmin)
                .andWhere('invoice.totalAmount >= :minAmount', { minAmount: range.minAmount });
            
            if (range.maxAmount < 999999999) {
                rangeQuery = rangeQuery.andWhere('invoice.totalAmount <= :maxAmount', { 
                    maxAmount: range.maxAmount 
                });
            }

            const result = await rangeQuery
                .select('COUNT(*) as count, SUM(invoice.totalAmount) as total')
                .getRawOne();

            const count = parseInt(result.count) || 0;
            const rangeTotal = parseFloat(result.total) || 0;
            const percentage = totalPayments > 0 ? (count / totalPayments) * 100 : 0;

            distribution.push({
                range: range.range,
                minAmount: range.minAmount,
                maxAmount: range.maxAmount === 999999999 ? Number.MAX_SAFE_INTEGER : range.maxAmount,
                count,
                totalAmount: rangeTotal,
                percentage: Math.round(percentage * 10) / 10,
            });
        }

        return distribution;
    }

    private handleServiceError(error: unknown, defaultMessage: string): never {
        if (error instanceof BadRequestException) {
            throw error;
        }
        
        if (error instanceof Error) {
            // Log the actual error for debugging
            this.logger.error(`Service error: ${error.message}`, error.stack);
            
            // Check for database-specific errors
            if (error.message.includes('relation') || error.message.includes('column')) {
                throw new BadRequestException('Database schema error - please contact administrator');
            }
            
            if (error.message.includes('timeout') || error.message.includes('connection')) {
                throw new BadRequestException('Database connection error - please try again');
            }
        }
        
        // Generic fallback
        throw new BadRequestException(defaultMessage);
    }
}