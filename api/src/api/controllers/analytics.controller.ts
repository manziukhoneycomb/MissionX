import {
    Controller,
    Get,
    Query,
    Inject,
    Req,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    ANALYTICS_SERVICE,
    IAnalyticsService,
} from '../../application/analytics/interfaces/analytics.service.interface';
import { AnalyticsResponseDto } from '../../application/analytics/dto/analytics-response.dto';
import { RevenueMetricsDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TopTenantsDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto } from '../../application/analytics/dto/payment-distribution.dto';
import { AnalyticsQueryDto, PeriodType } from '../../application/analytics/dto/analytics-query.dto';

interface RequestWithUserRoles extends RequestWithTenant {
    userRoles?: RoleName[];
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(@Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService) {}

    @Get('overview')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get analytics overview',
        description: 'Retrieves comprehensive analytics overview including revenue trends, tenant metrics, invoice status, and payment distribution',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics data (ISO date string)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics data (ISO date string)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: PeriodType,
        description: 'Period type for time-based aggregation',
        example: PeriodType.MONTHLY,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Limit for top results (e.g., top N tenants)',
        example: 10,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics overview retrieved successfully',
        type: AnalyticsResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid date range or query parameters',
    })
    async getAnalyticsOverview(
        @Req() request: RequestWithUserRoles,
        @Query() query: AnalyticsQueryDto,
    ): Promise<AnalyticsResponseDto> {
        this.validateDateRange(query);

        const tenantId = this.getTenantIdForUser(request);
        return this.analyticsService.getAnalyticsOverview(tenantId, query);
    }

    @Get('revenue')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue metrics',
        description: 'Retrieves detailed revenue metrics including trends, growth, and averages',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for revenue data',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for revenue data',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: PeriodType,
        description: 'Period type for trend aggregation',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue metrics retrieved successfully',
        type: RevenueMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getRevenueMetrics(
        @Req() request: RequestWithUserRoles,
        @Query() query: AnalyticsQueryDto,
    ): Promise<RevenueMetricsDto> {
        this.validateDateRange(query);

        const tenantId = this.getTenantIdForUser(request);
        return this.analyticsService.getRevenueMetrics(tenantId, query);
    }

    @Get('tenants')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant metrics',
        description: 'Retrieves tenant performance metrics including top performers by revenue, invoice count, and payment timeliness',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for tenant data',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for tenant data',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of top tenants to return',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: TopTenantsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTenantMetrics(
        @Req() request: RequestWithUserRoles,
        @Query() query: AnalyticsQueryDto,
    ): Promise<TopTenantsDto> {
        this.validateDateRange(query);

        const tenantId = this.getTenantIdForUser(request);
        return this.analyticsService.getTenantMetrics(tenantId, query);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status metrics',
        description: 'Retrieves invoice status overview including paid/unpaid/overdue counts and aging analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for invoice status data',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for invoice status data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status metrics retrieved successfully',
        type: InvoiceStatusDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getInvoiceStatusMetrics(
        @Req() request: RequestWithUserRoles,
        @Query() query: AnalyticsQueryDto,
    ): Promise<InvoiceStatusDto> {
        this.validateDateRange(query);

        const tenantId = this.getTenantIdForUser(request);
        return this.analyticsService.getInvoiceStatusMetrics(tenantId, query);
    }

    @Get('payments')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution metrics',
        description: 'Retrieves payment distribution data including payment methods and volume trends',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for payment data',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for payment data',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: PeriodType,
        description: 'Period type for volume trends',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution retrieved successfully',
        type: PaymentDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getPaymentDistribution(
        @Req() request: RequestWithUserRoles,
        @Query() query: AnalyticsQueryDto,
    ): Promise<PaymentDistributionDto> {
        this.validateDateRange(query);

        const tenantId = this.getTenantIdForUser(request);
        return this.analyticsService.getPaymentDistribution(tenantId, query);
    }

    private validateDateRange(query: AnalyticsQueryDto): void {
        if (query.startDate && query.endDate) {
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);

            if (startDate > endDate) {
                throw new BadRequestException('Start date must be before end date');
            }

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new BadRequestException('Invalid date format. Use ISO date string (YYYY-MM-DD)');
            }
        }

        if (query.limit && (query.limit < 1 || query.limit > 100)) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
    }

    private getTenantIdForUser(request: RequestWithUserRoles): string | null {
        if (request.userRoles?.includes(RoleName.SUPER_ADMIN)) {
            return null;
        }
        return request.tenantId || null;
    }
}