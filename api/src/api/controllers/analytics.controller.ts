import {
    Controller,
    Get,
    Query,
    Inject,
    HttpStatus,
    Req,
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
import { AnalyticsResponseDto } from '../../application/analytics/dto/analytics-response.dto';
import { RevenueTrendDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto } from '../../application/analytics/dto/payment-distribution.dto';
import { AnalyticsQueryDto, AnalyticsPeriod, MetricType } from '../../application/analytics/dto/analytics-query.dto';

interface RequestWithUserRoles extends RequestWithTenant {
    userRoles?: RoleName[];
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(ANALYTICS_SERVICE)
        private readonly analyticsService: IAnalyticsService
    ) {}

    @Get()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get comprehensive analytics',
        description: 'Retrieves comprehensive analytics data including revenue trends, tenant metrics, invoice status, and payment distribution',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics period (ISO date string)',
        example: '2023-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics period (ISO date string)',
        example: '2023-12-31',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: AnalyticsPeriod,
        description: 'Time period for trend analysis',
        example: AnalyticsPeriod.MONTHLY,
    })
    @ApiQuery({
        name: 'metricType',
        required: false,
        enum: MetricType,
        description: 'Specific metric type to retrieve',
        example: MetricType.ALL,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Limit for top results (e.g., top N tenants)',
        example: 10,
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics data retrieved successfully',
        type: AnalyticsResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters or date range',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getComprehensiveAnalytics(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<AnalyticsResponseDto> {
        const userTenantId = this.getUserTenantFilter(request);
        return this.analyticsService.getComprehensiveAnalytics(query, userTenantId);
    }

    @Get('revenue-trend')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue trend analytics',
        description: 'Retrieves revenue trend data over specified time periods with growth analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics period (ISO date string)',
        example: '2023-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics period (ISO date string)',
        example: '2023-12-31',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: AnalyticsPeriod,
        description: 'Time period for trend analysis',
        example: AnalyticsPeriod.MONTHLY,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trend data retrieved successfully',
        type: RevenueTrendDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getRevenueTrend(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<RevenueTrendDto> {
        const userTenantId = this.getUserTenantFilter(request);
        return this.analyticsService.getRevenueTrend(query, userTenantId);
    }

    @Get('tenant-metrics')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves tenant performance data including invoice counts, revenue, and payment timeliness',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics period (ISO date string)',
        example: '2023-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics period (ISO date string)',
        example: '2023-12-31',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Limit for top results (e.g., top N tenants)',
        example: 10,
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: TenantMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getTenantMetrics(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<TenantMetricsDto> {
        const userTenantId = this.getUserTenantFilter(request);
        return this.analyticsService.getTenantMetrics(query, userTenantId);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves invoice status breakdown including paid/unpaid counts and aging analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics period (ISO date string)',
        example: '2023-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics period (ISO date string)',
        example: '2023-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status data retrieved successfully',
        type: InvoiceStatusDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getInvoiceStatus(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<InvoiceStatusDto> {
        const userTenantId = this.getUserTenantFilter(request);
        return this.analyticsService.getInvoiceStatus(query, userTenantId);
    }

    @Get('payment-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution analytics',
        description: 'Retrieves payment method breakdown and payment size distribution analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics period (ISO date string)',
        example: '2023-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics period (ISO date string)',
        example: '2023-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution data retrieved successfully',
        type: PaymentDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getPaymentDistribution(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<PaymentDistributionDto> {
        const userTenantId = this.getUserTenantFilter(request);
        return this.analyticsService.getPaymentDistribution(query, userTenantId);
    }

    private getUserTenantFilter(request: RequestWithUserRoles): string | undefined {
        if (!request.userRoles?.includes(RoleName.SUPER_ADMIN)) {
            return request.tenantId;
        }
        return undefined;
    }
}