import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import { AnalyticsQueryDto, DateRangeType } from './dto/analytics-query.dto';
import { RevenueTrendDto, RevenueTrendDataPointDto, TopCustomerDto, PaymentDistributionDto } from './dto/revenue-trend.dto';
import { TenantMetricsDto, TenantPerformanceDto, InvoiceVolumeDataDto } from './dto/tenant-metrics.dto';
import { InvoiceStatusDto, StatusCountDto, AgingBracketDto, OverdueInvoiceDto } from './dto/invoice-status.dto';
import { ComprehensiveAnalyticsDto, AnalyticsSummaryDto } from './dto/analytics-response.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getComprehensiveAnalytics(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<ComprehensiveAnalyticsDto> {
        this.logger.log('Getting comprehensive analytics data');
        
        const dateRange = this.calculateDateRange(query);
        
        const [revenueTrend, tenantMetrics, invoiceStatus] = await Promise.all([
            this.getRevenueTrend(query, tenantId, isSuperAdmin),
            this.getTenantMetrics(query, tenantId, isSuperAdmin),
            this.getInvoiceStatus(query, tenantId, isSuperAdmin),
        ]);

        const summary = this.calculateSummary(revenueTrend, tenantMetrics, invoiceStatus);

        return {
            summary,
            revenueTrend,
            tenantMetrics,
            invoiceStatus,
            dateRange,
            generatedAt: new Date().toISOString(),
        };
    }

    async getRevenueTrend(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<RevenueTrendDto> {
        this.logger.log('Getting revenue trend data');
        
        const startTime = Date.now();
        const dateRange = this.calculateDateRange(query);
        const whereClause = this.buildWhereClause(dateRange, tenantId, isSuperAdmin);

        try {

        // Get revenue trend data
        const trendDataQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('DATE(invoice.issueDate)', 'date')
            .addSelect('SUM(invoice.totalAmount)', 'revenue')
            .addSelect('COUNT(invoice.id)', 'invoiceCount')
            .where(whereClause)
            .groupBy('DATE(invoice.issueDate)')
            .orderBy('DATE(invoice.issueDate)', 'ASC');

        const trendData = await trendDataQuery.getRawMany();

        // Get top customers
        const topCustomersQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('invoice.customerName', 'customerName')
            .addSelect('SUM(invoice.totalAmount)', 'totalRevenue')
            .addSelect('COUNT(invoice.id)', 'invoiceCount')
            .where(whereClause)
            .groupBy('invoice.customerName')
            .orderBy('SUM(invoice.totalAmount)', 'DESC')
            .limit(10);

        const topCustomersRaw = await topCustomersQuery.getRawMany();

        // Get payment distribution (simplified - would need payment status in real implementation)
        const paymentDistributionQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('CASE WHEN invoice.dueDate < CURRENT_DATE THEN \'Overdue\' ELSE \'Current\' END', 'label')
            .addSelect('SUM(invoice.totalAmount)', 'value')
            .addSelect('COUNT(invoice.id)', 'count')
            .where(whereClause)
            .groupBy('CASE WHEN invoice.dueDate < CURRENT_DATE THEN \'Overdue\' ELSE \'Current\' END');

        const paymentDistributionRaw = await paymentDistributionQuery.getRawMany();

        // Calculate totals
        const totalsQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.totalAmount)', 'totalRevenue')
            .addSelect('COUNT(invoice.id)', 'totalInvoices')
            .addSelect('AVG(invoice.totalAmount)', 'averageInvoiceValue')
            .where(whereClause);

        const totals = await totalsQuery.getRawOne();

        // Calculate growth (simplified - would compare with previous period)
        const growthPercentage = Math.random() * 20 - 10; // Placeholder

        // Transform data
        const trendDataPoints: RevenueTrendDataPointDto[] = trendData.map(item => ({
            date: item.date,
            revenue: parseFloat(item.revenue) || 0,
            invoiceCount: parseInt(item.invoiceCount) || 0,
        }));

        const totalRevenue = parseFloat(totals.totalRevenue) || 0;
        const topCustomers: TopCustomerDto[] = topCustomersRaw.map((customer, index) => ({
            customerName: customer.customerName,
            totalRevenue: parseFloat(customer.totalRevenue) || 0,
            invoiceCount: parseInt(customer.invoiceCount) || 0,
            revenuePercentage: totalRevenue > 0 ? ((parseFloat(customer.totalRevenue) || 0) / totalRevenue) * 100 : 0,
        }));

        const paymentDistribution: PaymentDistributionDto[] = paymentDistributionRaw.map(item => ({
            label: item.label,
            value: parseFloat(item.value) || 0,
            count: parseInt(item.count) || 0,
            percentage: totalRevenue > 0 ? ((parseFloat(item.value) || 0) / totalRevenue) * 100 : 0,
        }));

            const result = {
                trendData: trendDataPoints,
                totalRevenue,
                averageInvoiceValue: parseFloat(totals.averageInvoiceValue) || 0,
                totalInvoices: parseInt(totals.totalInvoices) || 0,
                growthPercentage,
                topCustomers,
                paymentDistribution,
            };

            const executionTime = Date.now() - startTime;
            this.logger.log(`Revenue trend query completed in ${executionTime}ms`);
            
            return result;
        } catch (error) {
            this.logger.error('Failed to get revenue trend data', error);
            throw new Error('Failed to retrieve revenue trend analytics');
        }
    }

    async getTenantMetrics(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<TenantMetricsDto> {
        this.logger.log('Getting tenant metrics data');
        
        const startTime = Date.now();
        const dateRange = this.calculateDateRange(query);
        const whereClause = this.buildWhereClause(dateRange, tenantId, isSuperAdmin);

        try {

        // Get tenant performance data
        const tenantPerformanceQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .innerJoin('invoice.tenant', 'tenant')
            .select('tenant.id', 'tenantId')
            .addSelect('tenant.name', 'tenantName')
            .addSelect('COUNT(invoice.id)', 'invoiceCount')
            .addSelect('SUM(invoice.totalAmount)', 'totalRevenue')
            .addSelect('AVG(invoice.totalAmount)', 'averageInvoiceValue')
            .addSelect('AVG(DATEDIFF(CURRENT_DATE, invoice.dueDate))', 'averagePaymentDays')
            .addSelect('COUNT(CASE WHEN invoice.dueDate >= CURRENT_DATE THEN 1 END) * 100.0 / COUNT(invoice.id)', 'paymentTimelinessPercentage')
            .addSelect('COUNT(CASE WHEN invoice.dueDate < CURRENT_DATE THEN 1 END)', 'overdueInvoices')
            .where(whereClause)
            .groupBy('tenant.id, tenant.name')
            .orderBy('SUM(invoice.totalAmount)', 'DESC')
            .limit(query.limit || 20);

        const tenantPerformanceRaw = await tenantPerformanceQuery.getRawMany();

        // Get invoice volume data over time
        const volumeDataQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('DATE(invoice.issueDate)', 'date')
            .addSelect('COUNT(invoice.id)', 'invoiceCount')
            .where(whereClause)
            .groupBy('DATE(invoice.issueDate)')
            .orderBy('DATE(invoice.issueDate)', 'ASC');

        const volumeData = await volumeDataQuery.getRawMany();

        // Get summary stats
        const summaryQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('COUNT(DISTINCT invoice.tenantId)', 'totalActiveTenants')
            .addSelect('AVG(tenant_invoice_counts.invoice_count)', 'averageInvoicesPerTenant')
            .leftJoin(
                '(' + this.invoiceRepository
                    .createQueryBuilder('sub_invoice')
                    .select('sub_invoice.tenantId', 'tenant_id')
                    .addSelect('COUNT(sub_invoice.id)', 'invoice_count')
                    .where(whereClause.replace('invoice.', 'sub_invoice.'))
                    .groupBy('sub_invoice.tenantId')
                    .getQuery() + ')',
                'tenant_invoice_counts',
                'tenant_invoice_counts.tenant_id = invoice.tenantId'
            )
            .where(whereClause);

        const summary = await summaryQuery.getRawOne();

        // Get most active and highest revenue tenants
        const mostActiveQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .innerJoin('invoice.tenant', 'tenant')
            .select('tenant.name', 'tenantName')
            .where(whereClause)
            .groupBy('tenant.id, tenant.name')
            .orderBy('COUNT(invoice.id)', 'DESC')
            .limit(1);

        const mostActive = await mostActiveQuery.getRawOne();

        const highestRevenueQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .innerJoin('invoice.tenant', 'tenant')
            .select('tenant.name', 'tenantName')
            .where(whereClause)
            .groupBy('tenant.id, tenant.name')
            .orderBy('SUM(invoice.totalAmount)', 'DESC')
            .limit(1);

        const highestRevenue = await highestRevenueQuery.getRawOne();

        // Transform data
        const tenantPerformance: TenantPerformanceDto[] = tenantPerformanceRaw.map(item => ({
            tenantId: item.tenantId,
            tenantName: item.tenantName,
            invoiceCount: parseInt(item.invoiceCount) || 0,
            totalRevenue: parseFloat(item.totalRevenue) || 0,
            averageInvoiceValue: parseFloat(item.averageInvoiceValue) || 0,
            averagePaymentDays: parseFloat(item.averagePaymentDays) || 0,
            paymentTimelinessPercentage: parseFloat(item.paymentTimelinessPercentage) || 0,
            overdueInvoices: parseInt(item.overdueInvoices) || 0,
        }));

        const invoiceVolumeData: InvoiceVolumeDataDto[] = volumeData.map(item => ({
            date: item.date,
            invoiceCount: parseInt(item.invoiceCount) || 0,
        }));

            const result = {
                tenantPerformance,
                invoiceVolumeData,
                totalActiveTenants: parseInt(summary.totalActiveTenants) || 0,
                averageInvoicesPerTenant: parseFloat(summary.averageInvoicesPerTenant) || 0,
                mostActiveTenant: mostActive?.tenantName || 'N/A',
                highestRevenueTenant: highestRevenue?.tenantName || 'N/A',
            };

            const executionTime = Date.now() - startTime;
            this.logger.log(`Tenant metrics query completed in ${executionTime}ms`);
            
            return result;
        } catch (error) {
            this.logger.error('Failed to get tenant metrics data', error);
            throw new Error('Failed to retrieve tenant metrics analytics');
        }
    }

    async getInvoiceStatus(
        query: AnalyticsQueryDto,
        tenantId?: string,
        isSuperAdmin?: boolean
    ): Promise<InvoiceStatusDto> {
        this.logger.log('Getting invoice status data');
        
        const startTime = Date.now();
        const dateRange = this.calculateDateRange(query);
        const whereClause = this.buildWhereClause(dateRange, tenantId, isSuperAdmin);

        try {

        // Get status counts (simplified - would need actual payment status in real implementation)
        const statusQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select(`
                CASE 
                    WHEN invoice.dueDate < CURRENT_DATE THEN 'Overdue'
                    WHEN invoice.dueDate >= CURRENT_DATE THEN 'Current'
                    ELSE 'Unknown'
                END
            `, 'status')
            .addSelect('COUNT(invoice.id)', 'count')
            .addSelect('SUM(invoice.totalAmount)', 'amount')
            .where(whereClause)
            .groupBy(`
                CASE 
                    WHEN invoice.dueDate < CURRENT_DATE THEN 'Overdue'
                    WHEN invoice.dueDate >= CURRENT_DATE THEN 'Current'
                    ELSE 'Unknown'
                END
            `);

        const statusRaw = await statusQuery.getRawMany();

        // Get aging analysis
        const agingQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select(`
                CASE 
                    WHEN DATEDIFF(CURRENT_DATE, invoice.dueDate) <= 30 THEN '0-30 days'
                    WHEN DATEDIFF(CURRENT_DATE, invoice.dueDate) <= 60 THEN '31-60 days'
                    WHEN DATEDIFF(CURRENT_DATE, invoice.dueDate) <= 90 THEN '61-90 days'
                    ELSE '90+ days'
                END
            `, 'ageRange')
            .addSelect('COUNT(invoice.id)', 'count')
            .addSelect('SUM(invoice.totalAmount)', 'amount')
            .where(`${whereClause} AND invoice.dueDate < CURRENT_DATE`)
            .groupBy(`
                CASE 
                    WHEN DATEDIFF(CURRENT_DATE, invoice.dueDate) <= 30 THEN '0-30 days'
                    WHEN DATEDIFF(CURRENT_DATE, invoice.dueDate) <= 60 THEN '31-60 days'
                    WHEN DATEDIFF(CURRENT_DATE, invoice.dueDate) <= 90 THEN '61-90 days'
                    ELSE '90+ days'
                END
            `);

        const agingRaw = await agingQuery.getRawMany();

        // Get top overdue invoices
        const overdueQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('invoice.id', 'invoiceId')
            .addSelect('invoice.invoiceNumber', 'invoiceNumber')
            .addSelect('invoice.customerName', 'customerName')
            .addSelect('invoice.totalAmount', 'totalAmount')
            .addSelect('invoice.dueDate', 'dueDate')
            .addSelect('DATEDIFF(CURRENT_DATE, invoice.dueDate)', 'daysOverdue')
            .where(`${whereClause} AND invoice.dueDate < CURRENT_DATE`)
            .orderBy('DATEDIFF(CURRENT_DATE, invoice.dueDate)', 'DESC')
            .limit(10);

        const overdueRaw = await overdueQuery.getRawMany();

        // Get totals for calculations
        const totalOutstandingQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.totalAmount)', 'totalOutstanding')
            .addSelect('AVG(DATEDIFF(CURRENT_DATE, invoice.dueDate))', 'averageDaysToPayment')
            .addSelect('COUNT(invoice.id)', 'totalInvoices')
            .addSelect('COUNT(CASE WHEN invoice.dueDate >= CURRENT_DATE THEN 1 END)', 'currentInvoices')
            .where(`${whereClause} AND invoice.dueDate < CURRENT_DATE`);

        const totals = await totalOutstandingQuery.getRawOne();

        // Transform data
        const totalInvoiceCount = statusRaw.reduce((sum, item) => sum + parseInt(item.count), 0);
        const totalAmount = statusRaw.reduce((sum, item) => sum + parseFloat(item.amount), 0);

        const statusCounts: StatusCountDto[] = statusRaw.map(item => ({
            status: item.status,
            count: parseInt(item.count) || 0,
            amount: parseFloat(item.amount) || 0,
            percentage: totalInvoiceCount > 0 ? (parseInt(item.count) / totalInvoiceCount) * 100 : 0,
        }));

        const totalOutstandingAmount = agingRaw.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        const agingAnalysis: AgingBracketDto[] = agingRaw.map(item => ({
            ageRange: item.ageRange,
            count: parseInt(item.count) || 0,
            amount: parseFloat(item.amount) || 0,
            percentage: totalOutstandingAmount > 0 ? (parseFloat(item.amount) / totalOutstandingAmount) * 100 : 0,
        }));

        const overdueInvoices: OverdueInvoiceDto[] = overdueRaw.map(item => ({
            invoiceId: item.invoiceId,
            invoiceNumber: item.invoiceNumber,
            customerName: item.customerName,
            totalAmount: parseFloat(item.totalAmount) || 0,
            dueDate: item.dueDate,
            daysOverdue: parseInt(item.daysOverdue) || 0,
        }));

        const totalOutstanding = parseFloat(totals.totalOutstanding) || 0;
        const averageDaysToPayment = parseFloat(totals.averageDaysToPayment) || 0;
        const totalInvoicesCount = parseInt(totals.totalInvoices) || 0;
        const currentInvoicesCount = parseInt(totals.currentInvoices) || 0;
        const collectionEfficiency = totalInvoicesCount > 0 ? (currentInvoicesCount / totalInvoicesCount) * 100 : 100;

            const result = {
                statusCounts,
                agingAnalysis,
                overdueInvoices,
                totalOutstanding,
                averageDaysToPayment,
                collectionEfficiency,
            };

            const executionTime = Date.now() - startTime;
            this.logger.log(`Invoice status query completed in ${executionTime}ms`);
            
            return result;
        } catch (error) {
            this.logger.error('Failed to get invoice status data', error);
            throw new Error('Failed to retrieve invoice status analytics');
        }
    }

    private calculateDateRange(query: AnalyticsQueryDto): { startDate: string; endDate: string } {
        const today = new Date();
        let startDate: Date;
        let endDate: Date = new Date(today);

        if (query.dateRange === DateRangeType.CUSTOM && query.startDate && query.endDate) {
            startDate = new Date(query.startDate);
            endDate = new Date(query.endDate);
        } else {
            switch (query.dateRange) {
                case DateRangeType.LAST_7_DAYS:
                    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case DateRangeType.LAST_90_DAYS:
                    startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case DateRangeType.LAST_YEAR:
                    startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                case DateRangeType.LAST_30_DAYS:
                default:
                    startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };
    }

    private buildWhereClause(
        dateRange: { startDate: string; endDate: string },
        tenantId?: string,
        isSuperAdmin?: boolean
    ): string {
        this.validateDateRange(dateRange);
        
        let whereClause = `invoice.issueDate >= '${dateRange.startDate}' AND invoice.issueDate <= '${dateRange.endDate}'`;
        
        if (!isSuperAdmin && tenantId) {
            whereClause += ` AND invoice.tenantId = '${tenantId}'`;
        }
        
        return whereClause;
    }

    private validateDateRange(dateRange: { startDate: string; endDate: string }): void {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Invalid date range provided');
        }
        
        if (startDate >= endDate) {
            throw new Error('Start date must be before end date');
        }

        // Prevent queries that are too broad (more than 2 years)
        const maxDaysDiff = 730;
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > maxDaysDiff) {
            throw new Error(`Date range too broad. Maximum ${maxDaysDiff} days allowed`);
        }
    }

    private async optimizeQuery(queryBuilder: any): Promise<any> {
        // Add query timeout and result size limits for performance
        return queryBuilder
            .timeout(30000) // 30 second timeout
            .limit(10000); // Maximum 10k results
    }

    private calculateSummary(
        revenueTrend: RevenueTrendDto,
        tenantMetrics: TenantMetricsDto,
        invoiceStatus: InvoiceStatusDto
    ): AnalyticsSummaryDto {
        const totalCustomers = revenueTrend.topCustomers.length;
        const paidInvoicesCount = invoiceStatus.statusCounts
            .filter(status => status.status !== 'Overdue')
            .reduce((sum, status) => sum + status.count, 0);
        const overdueInvoicesCount = invoiceStatus.statusCounts
            .filter(status => status.status === 'Overdue')
            .reduce((sum, status) => sum + status.count, 0);

        return {
            totalRevenue: revenueTrend.totalRevenue,
            totalInvoices: revenueTrend.totalInvoices,
            totalCustomers,
            totalTenants: tenantMetrics.totalActiveTenants,
            averageInvoiceValue: revenueTrend.averageInvoiceValue,
            paidInvoices: paidInvoicesCount,
            unpaidInvoices: revenueTrend.totalInvoices - paidInvoicesCount - overdueInvoicesCount,
            overdueInvoices: overdueInvoicesCount,
            revenueGrowth: revenueTrend.growthPercentage,
        };
    }
}