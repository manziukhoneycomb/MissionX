import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import {
    RevenueTrendResponseDto,
    RevenueDataPointDto,
    TopCustomerDto,
} from './dto/revenue-trend.dto';
import { TenantMetricsResponseDto, TenantPerformanceDto } from './dto/tenant-metrics.dto';
import {
    InvoiceStatusResponseDto,
    InvoiceStatusOverviewDto,
    InvoiceStatusCountDto,
    InvoiceStatusEnum,
    AgingBucketDto,
} from './dto/invoice-status.dto';
import {
    PaymentDistributionResponseDto,
    PaymentDistributionOverviewDto,
    PaymentMethodDto,
    PaymentVolumeDto,
} from './dto/payment-distribution.dto';
import { DateRangeDto, AnalyticsQueryDto, AnalyticsMetaDto } from './dto/analytics-response.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getRevenueTrends(
        tenantId: string | null,
        dateRange: DateRangeDto,
        groupBy: 'month' | 'quarter' | 'year' = 'month',
    ): Promise<RevenueTrendResponseDto> {
        this.logger.log(`Getting revenue trends for tenant: ${tenantId}, group by: ${groupBy}`);

        try {
            this.validateDateRange(dateRange);

            const query = this.invoiceRepository.createQueryBuilder('invoice')
            .select([
                this.getDateTruncExpression(groupBy, 'invoice.issueDate') + ' as period',
                'COUNT(invoice.id)::int as invoiceCount',
                'SUM(invoice.totalAmount)::numeric as revenue',
                'AVG(invoice.totalAmount)::numeric as avgInvoiceValue',
            ])
            .where('invoice.issueDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate })
            .groupBy('period')
            .orderBy('period', 'ASC');

        if (tenantId) {
            query.andWhere('invoice.tenantId = :tenantId', { tenantId });
        }

        const rawResults = await query.getRawMany();

        const data: RevenueDataPointDto[] = rawResults.map((row) => ({
            period: this.formatPeriod(row.period, groupBy),
            value: parseFloat(row.revenue) || 0,
            label: this.getPeriodLabel(row.period, groupBy),
            revenue: parseFloat(row.revenue) || 0,
            invoiceCount: parseInt(row.invoiceCount) || 0,
            avgInvoiceValue: parseFloat(row.avgInvoiceValue) || 0,
        }));

        const meta: AnalyticsMetaDto = {
            total: data.reduce((sum, item) => sum + item.invoiceCount, 0),
            dateRange,
            generatedAt: new Date().toISOString(),
        };

            return { data, meta };
        } catch (error) {
            this.logger.error(`Error getting revenue trends: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve revenue trends');
        }
    }

    async getTopCustomers(
        tenantId: string | null,
        dateRange: DateRangeDto,
        limit: number = 10,
    ): Promise<TopCustomerDto[]> {
        this.logger.log(`Getting top customers for tenant: ${tenantId}, limit: ${limit}`);

        try {
            this.validateDateRange(dateRange);
            if (limit <= 0 || limit > 100) {
                throw new BadRequestException('Limit must be between 1 and 100');
            }

            const query = this.invoiceRepository.createQueryBuilder('invoice')
            .select([
                'invoice.customerName as customerName',
                'COUNT(invoice.id)::int as invoiceCount',
                'SUM(invoice.totalAmount)::numeric as totalRevenue',
            ])
            .where('invoice.issueDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate })
            .groupBy('invoice.customerName')
            .orderBy('totalRevenue', 'DESC')
            .limit(limit);

        if (tenantId) {
            query.andWhere('invoice.tenantId = :tenantId', { tenantId });
        }

        const rawResults = await query.getRawMany();

        const totalRevenue = rawResults.reduce((sum, row) => sum + parseFloat(row.totalRevenue), 0);

            return rawResults.map((row) => ({
                customerName: row.customerName,
                totalRevenue: parseFloat(row.totalRevenue) || 0,
                invoiceCount: parseInt(row.invoiceCount) || 0,
                revenuePercentage: totalRevenue > 0 ? ((parseFloat(row.totalRevenue) / totalRevenue) * 100) : 0,
            }));
        } catch (error) {
            this.logger.error(`Error getting top customers: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve top customers');
        }
    }

    async getTenantMetrics(
        tenantId: string | null,
        query: AnalyticsQueryDto,
    ): Promise<TenantMetricsResponseDto> {
        this.logger.log(`Getting tenant metrics for tenant: ${tenantId}`);

        try {
            this.validateDateRange({ startDate: query.startDate, endDate: query.endDate });

            const baseQuery = this.invoiceRepository.createQueryBuilder('invoice')
            .leftJoin('invoice.tenant', 'tenant')
            .select([
                'invoice.tenantId as tenantId',
                'tenant.name as tenantName',
                'COUNT(invoice.id)::int as invoiceCount',
                'SUM(invoice.totalAmount)::numeric as totalRevenue',
                'AVG(invoice.totalAmount)::numeric as avgInvoiceValue',
                'COUNT(CASE WHEN invoice.dueDate < CURRENT_DATE THEN 1 END)::int as overdueInvoices',
                'COUNT(CASE WHEN invoice.dueDate >= CURRENT_DATE THEN 1 END)::int as pendingInvoices',
                'COUNT(CASE WHEN invoice.dueDate < CURRENT_DATE THEN 1 END)::int as paidInvoices',
            ])
            .where('invoice.issueDate >= :startDate', { startDate: query.startDate })
            .andWhere('invoice.issueDate <= :endDate', { endDate: query.endDate })
            .groupBy('invoice.tenantId, tenant.name')
            .orderBy('totalRevenue', 'DESC');

        if (tenantId) {
            baseQuery.andWhere('invoice.tenantId = :tenantId', { tenantId });
        }

        if (query.limit) {
            baseQuery.limit(query.limit);
        }
        if (query.page && query.limit) {
            baseQuery.offset((query.page - 1) * query.limit);
        }

        const rawResults = await baseQuery.getRawMany();

        const tenants: TenantPerformanceDto[] = rawResults.map((row) => {
            const totalInvoices = parseInt(row.invoiceCount) || 0;
            const paidInvoices = totalInvoices - (parseInt(row.overdueInvoices) || 0) - (parseInt(row.pendingInvoices) || 0);
            
            return {
                tenantId: row.tenantId,
                tenantName: row.tenantName || 'Unknown',
                invoiceCount: totalInvoices,
                totalRevenue: parseFloat(row.totalRevenue) || 0,
                avgInvoiceValue: parseFloat(row.avgInvoiceValue) || 0,
                paidInvoices: Math.max(0, paidInvoices),
                pendingInvoices: parseInt(row.pendingInvoices) || 0,
                overdueInvoices: parseInt(row.overdueInvoices) || 0,
                paymentTimeliness: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
            };
        });

        const meta: AnalyticsMetaDto = {
            total: tenants.length,
            dateRange: { startDate: query.startDate, endDate: query.endDate },
            generatedAt: new Date().toISOString(),
        };

            return { tenants, data: [], meta };
        } catch (error) {
            this.logger.error(`Error getting tenant metrics: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve tenant metrics');
        }
    }

    async getInvoiceStatusOverview(
        tenantId: string | null,
        dateRange: DateRangeDto,
    ): Promise<InvoiceStatusResponseDto> {
        this.logger.log(`Getting invoice status overview for tenant: ${tenantId}`);

        try {
            this.validateDateRange(dateRange);

            const baseQuery = this.invoiceRepository.createQueryBuilder('invoice')
            .where('invoice.issueDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate });

        if (tenantId) {
            baseQuery.andWhere('invoice.tenantId = :tenantId', { tenantId });
        }

        const statusQuery = baseQuery.clone()
            .select([
                `CASE 
                    WHEN invoice.dueDate < CURRENT_DATE THEN '${InvoiceStatusEnum.OVERDUE}'
                    WHEN invoice.dueDate >= CURRENT_DATE THEN '${InvoiceStatusEnum.PENDING}'
                    ELSE '${InvoiceStatusEnum.PAID}'
                END as status`,
                'COUNT(invoice.id)::int as count',
                'SUM(invoice.totalAmount)::numeric as totalValue',
            ])
            .groupBy('status');

        const statusResults = await statusQuery.getRawMany();
        const totalInvoices = statusResults.reduce((sum, row) => sum + parseInt(row.count), 0);
        const totalValue = statusResults.reduce((sum, row) => sum + parseFloat(row.totalValue), 0);

        const statusBreakdown: InvoiceStatusCountDto[] = statusResults.map((row) => ({
            status: row.status as InvoiceStatusEnum,
            count: parseInt(row.count) || 0,
            totalValue: parseFloat(row.totalValue) || 0,
            percentage: totalInvoices > 0 ? ((parseInt(row.count) / totalInvoices) * 100) : 0,
        }));

        const agingQuery = baseQuery.clone()
            .select([
                `CASE 
                    WHEN CURRENT_DATE - invoice.dueDate <= 30 THEN '0-30 days'
                    WHEN CURRENT_DATE - invoice.dueDate <= 60 THEN '31-60 days'
                    WHEN CURRENT_DATE - invoice.dueDate <= 90 THEN '61-90 days'
                    ELSE '90+ days'
                END as bucket`,
                'COUNT(invoice.id)::int as count',
                'SUM(invoice.totalAmount)::numeric as totalValue',
            ])
            .where('invoice.dueDate < CURRENT_DATE')
            .groupBy('bucket');

        const agingResults = await agingQuery.getRawMany();

        const agingAnalysis: AgingBucketDto[] = agingResults.map((row) => ({
            bucket: row.bucket,
            count: parseInt(row.count) || 0,
            totalValue: parseFloat(row.totalValue) || 0,
            daysRange: this.getAgingRange(row.bucket),
        }));

        const overview: InvoiceStatusOverviewDto = {
            statusBreakdown,
            agingAnalysis,
            totalInvoices,
            totalValue,
        };

        const meta: AnalyticsMetaDto = {
            total: totalInvoices,
            dateRange,
            generatedAt: new Date().toISOString(),
        };

            return { overview, data: [], meta };
        } catch (error) {
            this.logger.error(`Error getting invoice status overview: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve invoice status overview');
        }
    }

    async getPaymentDistribution(
        tenantId: string | null,
        dateRange: DateRangeDto,
    ): Promise<PaymentDistributionResponseDto> {
        this.logger.log(`Getting payment distribution for tenant: ${tenantId}`);

        const baseQuery = this.invoiceRepository.createQueryBuilder('invoice')
            .where('invoice.issueDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate });

        if (tenantId) {
            baseQuery.andWhere('invoice.tenantId = :tenantId', { tenantId });
        }

        const paymentMethods: PaymentMethodDto[] = [
            {
                method: 'Invoice',
                count: 0,
                totalValue: 0,
                countPercentage: 0,
                valuePercentage: 0,
            }
        ];

        const volumeQuery = baseQuery.clone()
            .select([
                `CASE 
                    WHEN invoice.totalAmount < 1000 THEN 'Under $1,000'
                    WHEN invoice.totalAmount < 5000 THEN '$1,000 - $5,000'
                    WHEN invoice.totalAmount < 10000 THEN '$5,000 - $10,000'
                    ELSE '$10,000+'
                END as rangeLabel`,
                'COUNT(invoice.id)::int as count',
                'SUM(invoice.totalAmount)::numeric as totalValue',
            ])
            .groupBy('rangeLabel');

        const volumeResults = await volumeQuery.getRawMany();
        const totalPayments = volumeResults.reduce((sum, row) => sum + parseInt(row.count), 0);

        const volumeDistribution: PaymentVolumeDto[] = volumeResults.map((row) => ({
            rangeLabel: row.rangeLabel,
            minAmount: this.getMinAmount(row.rangeLabel),
            maxAmount: this.getMaxAmount(row.rangeLabel),
            count: parseInt(row.count) || 0,
            totalValue: parseFloat(row.totalValue) || 0,
            percentage: totalPayments > 0 ? ((parseInt(row.count) / totalPayments) * 100) : 0,
        }));

        const totalValueResult = await baseQuery.clone()
            .select(['SUM(invoice.totalAmount)::numeric as totalValue', 'COUNT(invoice.id)::int as count'])
            .getRawOne();

        const totalValue = parseFloat(totalValueResult?.totalValue) || 0;
        const totalCount = parseInt(totalValueResult?.count) || 0;

        paymentMethods[0].count = totalCount;
        paymentMethods[0].totalValue = totalValue;
        paymentMethods[0].countPercentage = 100;
        paymentMethods[0].valuePercentage = 100;

        const overview: PaymentDistributionOverviewDto = {
            paymentMethods,
            volumeDistribution,
            totalPayments: totalCount,
            totalValue,
            averagePayment: totalCount > 0 ? totalValue / totalCount : 0,
        };

        const meta: AnalyticsMetaDto = {
            total: totalCount,
            dateRange,
            generatedAt: new Date().toISOString(),
        };

        return { overview, data: [], meta };
    }

    private getDateTruncExpression(groupBy: string, dateColumn: string): string {
        switch (groupBy) {
            case 'year':
                return `DATE_TRUNC('year', ${dateColumn})`;
            case 'quarter':
                return `DATE_TRUNC('quarter', ${dateColumn})`;
            case 'month':
            default:
                return `DATE_TRUNC('month', ${dateColumn})`;
        }
    }

    private formatPeriod(period: string, groupBy: string): string {
        const date = new Date(period);
        switch (groupBy) {
            case 'year':
                return date.getFullYear().toString();
            case 'quarter':
                return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
            case 'month':
            default:
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
    }

    private getPeriodLabel(period: string, groupBy: string): string {
        const date = new Date(period);
        switch (groupBy) {
            case 'year':
                return date.getFullYear().toString();
            case 'quarter':
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                return `Q${quarter} ${date.getFullYear()}`;
            case 'month':
            default:
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        }
    }

    private getAgingRange(bucket: string): { min: number; max: number | null } {
        switch (bucket) {
            case '0-30 days':
                return { min: 0, max: 30 };
            case '31-60 days':
                return { min: 31, max: 60 };
            case '61-90 days':
                return { min: 61, max: 90 };
            case '90+ days':
            default:
                return { min: 90, max: null };
        }
    }

    private getMinAmount(rangeLabel: string): number {
        switch (rangeLabel) {
            case 'Under $1,000':
                return 0;
            case '$1,000 - $5,000':
                return 1000;
            case '$5,000 - $10,000':
                return 5000;
            case '$10,000+':
                return 10000;
            default:
                return 0;
        }
    }

    private getMaxAmount(rangeLabel: string): number | null {
        switch (rangeLabel) {
            case 'Under $1,000':
                return 1000;
            case '$1,000 - $5,000':
                return 5000;
            case '$5,000 - $10,000':
                return 10000;
            case '$10,000+':
                return null;
            default:
                return null;
        }
    }

    private validateDateRange(dateRange: DateRangeDto): void {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        if (isNaN(startDate.getTime())) {
            throw new BadRequestException('Invalid start date format');
        }

        if (isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid end date format');
        }

        if (startDate >= endDate) {
            throw new BadRequestException('Start date must be before end date');
        }

        const maxRangeDays = 365 * 3; // 3 years
        const daysDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDifference > maxRangeDays) {
            throw new BadRequestException('Date range cannot exceed 3 years');
        }
    }
}