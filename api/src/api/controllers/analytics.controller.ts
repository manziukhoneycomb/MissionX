import {
    Controller,
    Get,
    Query,
    Req,
    Inject,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    ANALYTICS_SERVICE,
    IAnalyticsService,
} from '../../application/analytics/interfaces/analytics.service.interface';
import {
    AnalyticsOverviewDto,
    RevenueMetricsDto,
    TenantMetricsDto,
    InvoiceStatusMetricsDto,
    PaymentMetricsDto,
    DateRangeDto,
} from '../../application/analytics/dto/analytics.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(@Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService) {}

    @Get('overview')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get analytics overview',
        description: 'Retrieves key analytics metrics overview including totals and trends',
    })
    @ApiResponse({
        status: 200,
        description: 'Analytics overview retrieved successfully',
        type: AnalyticsOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getOverview(@Req() request: RequestWithTenant): Promise<AnalyticsOverviewDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getOverview(tenantId);
    }

    @Get('revenue')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue metrics',
        description: 'Retrieves revenue trends, top customers, and payment distribution data',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for metrics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for metrics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'groupBy',
        required: false,
        enum: ['day', 'week', 'month', 'quarter'],
        description: 'Group revenue data by time period',
    })
    @ApiResponse({
        status: 200,
        description: 'Revenue metrics retrieved successfully',
        type: RevenueMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getRevenueMetrics(
        @Req() request: RequestWithTenant,
        @Query() dateRange: DateRangeDto,
    ): Promise<RevenueMetricsDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getRevenueMetrics(tenantId, dateRange);
    }

    @Get('tenants')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant metrics',
        description: 'Retrieves tenant performance data including invoices per tenant and payment timeliness',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for metrics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for metrics (YYYY-MM-DD)',
    })
    @ApiResponse({
        status: 200,
        description: 'Tenant metrics retrieved successfully',
        type: TenantMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTenantMetrics(
        @Req() request: RequestWithTenant,
        @Query() dateRange: DateRangeDto,
    ): Promise<TenantMetricsDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getTenantMetrics(tenantId, dateRange);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status metrics',
        description: 'Retrieves invoice status distribution and aging analysis',
    })
    @ApiResponse({
        status: 200,
        description: 'Invoice status metrics retrieved successfully',
        type: InvoiceStatusMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getInvoiceStatusMetrics(@Req() request: RequestWithTenant): Promise<InvoiceStatusMetricsDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getInvoiceStatusMetrics(tenantId);
    }

    @Get('payments')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment metrics',
        description: 'Retrieves payment distribution and timeliness metrics',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for metrics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for metrics (YYYY-MM-DD)',
    })
    @ApiResponse({
        status: 200,
        description: 'Payment metrics retrieved successfully',
        type: PaymentMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getPaymentMetrics(
        @Req() request: RequestWithTenant,
        @Query() dateRange: DateRangeDto,
    ): Promise<PaymentMetricsDto> {
        const tenantId = request.tenantId!;
        return this.analyticsService.getPaymentMetrics(tenantId, dateRange);
    }
}