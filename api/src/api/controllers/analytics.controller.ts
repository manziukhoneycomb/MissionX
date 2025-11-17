import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { RoleName } from '../../domain/enums/role-name.enum';
import { AnalyticsService } from '../../application/analytics/analytics.service';
import {
    AnalyticsQueryDto,
    AnalyticsResponseDto,
    RevenueMetricDto,
    TenantPerformanceDto,
    InvoiceStatusOverviewDto,
    PaymentDistributionDto,
} from '../../application/analytics/dto/analytics.dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get()
    @Authorize([RoleName.ADMIN, RoleName.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get comprehensive analytics data' })
    @ApiResponse({
        status: 200,
        description: 'Analytics data retrieved successfully',
        type: AnalyticsResponseDto,
    })
    async getAnalytics(@Query() query: AnalyticsQueryDto): Promise<AnalyticsResponseDto> {
        return this.analyticsService.getAnalytics(query);
    }

    @Get('revenue')
    @Authorize([RoleName.ADMIN, RoleName.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get revenue metrics over time' })
    @ApiResponse({
        status: 200,
        description: 'Revenue metrics retrieved successfully',
        type: [RevenueMetricDto],
    })
    async getRevenueMetrics(@Query() query: AnalyticsQueryDto): Promise<RevenueMetricDto[]> {
        return this.analyticsService.getRevenueMetrics(query);
    }

    @Get('tenants')
    @Authorize([RoleName.ADMIN, RoleName.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get tenant performance metrics' })
    @ApiResponse({
        status: 200,
        description: 'Tenant performance metrics retrieved successfully',
        type: [TenantPerformanceDto],
    })
    async getTenantPerformance(@Query() query: AnalyticsQueryDto): Promise<TenantPerformanceDto[]> {
        return this.analyticsService.getTenantPerformance(query);
    }

    @Get('invoice-status')
    @Authorize([RoleName.ADMIN, RoleName.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get invoice status overview' })
    @ApiResponse({
        status: 200,
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto,
    })
    async getInvoiceStatusOverview(@Query() query: AnalyticsQueryDto): Promise<InvoiceStatusOverviewDto> {
        return this.analyticsService.getInvoiceStatusOverview(query);
    }

    @Get('payment-distribution')
    @Authorize([RoleName.ADMIN, RoleName.SUPER_ADMIN])
    @ApiOperation({ summary: 'Get payment distribution data' })
    @ApiResponse({
        status: 200,
        description: 'Payment distribution data retrieved successfully',
        type: [PaymentDistributionDto],
    })
    async getPaymentDistribution(@Query() query: AnalyticsQueryDto): Promise<PaymentDistributionDto[]> {
        return this.analyticsService.getPaymentDistribution(query);
    }
}