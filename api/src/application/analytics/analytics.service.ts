import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import {
    IAnalyticsService,
} from './interfaces/analytics.service.interface';
import {
    AnalyticsQueryDto,
    AnalyticsResponseDto,
    RevenueMetricDto,
    TenantPerformanceDto,
    InvoiceStatusOverviewDto,
    PaymentDistributionDto,
    DateRangeEnum,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getAnalytics(query: AnalyticsQueryDto): Promise<AnalyticsResponseDto> {
        const [revenueMetrics, tenantPerformance, invoiceStatusOverview, paymentDistribution] =
            await Promise.all([
                this.getRevenueMetrics(query),
                this.getTenantPerformance(query),
                this.getInvoiceStatusOverview(query),
                this.getPaymentDistribution(query),
            ]);

        return {
            revenueMetrics,
            tenantPerformance,
            invoiceStatusOverview,
            paymentDistribution,
            generatedAt: new Date().toISOString(),
        };
    }

    async getRevenueMetrics(query: AnalyticsQueryDto): Promise<RevenueMetricDto[]> {
        const { startDate, endDate } = this.getDateRange(query);
        
        const queryBuilder = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                "DATE_TRUNC('month', invoice.issueDate) as period",
                'SUM(invoice.totalAmount) as totalRevenue',
                'COUNT(*) as invoiceCount',
                'AVG(invoice.totalAmount) as averageInvoiceValue'
            ])
            .where('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy("DATE_TRUNC('month', invoice.issueDate)")
            .orderBy('period', 'ASC');

        if (query.tenantId) {
            queryBuilder.andWhere('invoice.tenantId = :tenantId', { tenantId: query.tenantId });
        }

        const results = await queryBuilder.getRawMany();

        return results.map(result => ({
            period: new Date(result.period).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            totalRevenue: parseFloat(result.totalrevenue) || 0,
            invoiceCount: parseInt(result.invoicecount) || 0,
            averageInvoiceValue: parseFloat(result.averageinvoicevalue) || 0,
        }));
    }

    async getTenantPerformance(query: AnalyticsQueryDto): Promise<TenantPerformanceDto[]> {
        const { startDate, endDate } = this.getDateRange(query);
        
        const queryBuilder = this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.tenant', 'tenant')
            .select([
                'tenant.id as tenantId',
                'tenant.name as tenantName',
                'COUNT(*) as totalInvoices',
                'SUM(invoice.totalAmount) as totalRevenue',
                'AVG(invoice.totalAmount) as averageInvoiceValue',
                'AVG(CASE WHEN invoice.dueDate >= CURRENT_DATE THEN 100 ELSE 50 END) as paymentScore'
            ])
            .where('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('tenant.id, tenant.name')
            .orderBy('totalRevenue', 'DESC');

        if (query.tenantId) {
            queryBuilder.andWhere('tenant.id = :tenantId', { tenantId: query.tenantId });
        }

        const results = await queryBuilder.getRawMany();

        return results.map(result => ({
            tenantId: result.tenantid,
            tenantName: result.tenantname || 'Unknown Tenant',
            totalInvoices: parseInt(result.totalinvoices) || 0,
            totalRevenue: parseFloat(result.totalrevenue) || 0,
            averageInvoiceValue: parseFloat(result.averageinvoicevalue) || 0,
            paymentScore: parseFloat(result.paymentscore) || 0,
        }));
    }

    async getInvoiceStatusOverview(query: AnalyticsQueryDto): Promise<InvoiceStatusOverviewDto> {
        const { startDate, endDate } = this.getDateRange(query);
        const currentDate = new Date().toISOString().split('T')[0];

        const queryBuilder = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'COUNT(*) as total',
                `COUNT(CASE WHEN invoice.dueDate >= '${currentDate}' THEN 1 END) as paid`,
                `COUNT(CASE WHEN invoice.dueDate < '${currentDate}' THEN 1 END) as overdue`
            ])
            .where('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate });

        if (query.tenantId) {
            queryBuilder.andWhere('invoice.tenantId = :tenantId', { tenantId: query.tenantId });
        }

        const result = await queryBuilder.getRawOne();
        
        const total = parseInt(result.total) || 0;
        const paid = parseInt(result.paid) || 0;
        const overdue = parseInt(result.overdue) || 0;
        const unpaid = total - paid;

        return {
            paid,
            unpaid: unpaid < 0 ? 0 : unpaid,
            overdue,
            total,
        };
    }

    async getPaymentDistribution(query: AnalyticsQueryDto): Promise<PaymentDistributionDto[]> {
        const { startDate, endDate } = this.getDateRange(query);

        const queryBuilder = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                `CASE 
                    WHEN invoice.totalAmount < 1000 THEN 'Small (< $1K)'
                    WHEN invoice.totalAmount < 5000 THEN 'Medium ($1K-$5K)'
                    WHEN invoice.totalAmount < 10000 THEN 'Large ($5K-$10K)'
                    ELSE 'Enterprise (> $10K)'
                END as category`,
                'COUNT(*) as count',
                'SUM(invoice.totalAmount) as amount'
            ])
            .where('invoice.issueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('category')
            .orderBy('amount', 'DESC');

        if (query.tenantId) {
            queryBuilder.andWhere('invoice.tenantId = :tenantId', { tenantId: query.tenantId });
        }

        const results = await queryBuilder.getRawMany();
        const totalAmount = results.reduce((sum, result) => sum + parseFloat(result.amount || '0'), 0);

        return results.map(result => {
            const amount = parseFloat(result.amount) || 0;
            return {
                category: result.category,
                count: parseInt(result.count) || 0,
                amount,
                percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
            };
        });
    }

    private getDateRange(query: AnalyticsQueryDto): { startDate: string; endDate: string } {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date(now);

        if (query.dateRange === DateRangeEnum.CUSTOM && query.startDate && query.endDate) {
            startDate = new Date(query.startDate);
            endDate = new Date(query.endDate);
        } else {
            switch (query.dateRange) {
                case DateRangeEnum.LAST_30_DAYS:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case DateRangeEnum.LAST_90_DAYS:
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case DateRangeEnum.LAST_6_MONTHS:
                    startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                    break;
                case DateRangeEnum.LAST_YEAR:
                    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };
    }
}