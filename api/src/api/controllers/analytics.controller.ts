import {
    Controller,
    Get,
    Query,
    Inject,
    HttpStatus,
    Req,
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
import { AnalyticsQueryDto, AnalyticsResponseDto } from '../../application/analytics/dto/analytics-response.dto';
import { RevenueTrendDto, MonthlyRevenueDto, QuarterlyRevenueDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsDto, TopCustomerDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusDto, InvoiceAgingDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto } from '../../application/analytics/dto/payment-distribution.dto';

interface RequestWithUserRoles extends RequestWithTenant {
    userRoles?: RoleName[];
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService,
    ) {}

    @Get()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get comprehensive analytics dashboard',
        description: 'Retrieves all analytics data including revenue trends, tenant metrics, invoice status, and payment distribution',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
        example: '2023-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
        example: '2023-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics data retrieved successfully',
        type: AnalyticsResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getComprehensiveAnalytics(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<AnalyticsResponseDto> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getComprehensiveAnalytics(queryParams, userTenantId);
    }

    @Get('revenue/trends')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue trends',
        description: 'Retrieves revenue trends over time periods',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trends retrieved successfully',
        type: [RevenueTrendDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getRevenueTrends(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<RevenueTrendDto[]> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getRevenueTrends(queryParams, userTenantId);
    }

    @Get('revenue/monthly')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get monthly revenue',
        description: 'Retrieves monthly revenue breakdown',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Monthly revenue retrieved successfully',
        type: [MonthlyRevenueDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getMonthlyRevenue(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<MonthlyRevenueDto[]> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getMonthlyRevenue(queryParams, userTenantId);
    }

    @Get('revenue/quarterly')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get quarterly revenue',
        description: 'Retrieves quarterly revenue breakdown',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Quarterly revenue retrieved successfully',
        type: [QuarterlyRevenueDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getQuarterlyRevenue(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<QuarterlyRevenueDto[]> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getQuarterlyRevenue(queryParams, userTenantId);
    }

    @Get('tenants/metrics')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves performance metrics for all or specific tenants',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: [TenantMetricsDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTenantMetrics(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<TenantMetricsDto[]> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getTenantMetrics(queryParams, userTenantId);
    }

    @Get('customers/top')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get top customers',
        description: 'Retrieves top customers by revenue',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of top customers to return (default: 10)',
        example: 10,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Top customers retrieved successfully',
        type: [TopCustomerDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTopCustomers(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
        @Query('limit') limit?: number,
    ): Promise<TopCustomerDto[]> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getTopCustomers(queryParams, userTenantId, limit);
    }

    @Get('invoices/status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves overview of invoice statuses (paid, unpaid, overdue)',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status retrieved successfully',
        type: InvoiceStatusDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getInvoiceStatus(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<InvoiceStatusDto> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getInvoiceStatus(queryParams, userTenantId);
    }

    @Get('invoices/aging')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice aging analysis',
        description: 'Retrieves aging analysis of invoices by overdue periods',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice aging retrieved successfully',
        type: [InvoiceAgingDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getInvoiceAging(
        @Req() request: RequestWithUserRoles,
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<InvoiceAgingDto[]> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getInvoiceAging(queryParams, userTenantId);
    }

    @Get('payments/distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution',
        description: 'Retrieves payment distribution by timing, amount range, customer, and vendor',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics range (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID to filter by (Super Admin only)',
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
        @Query() queryParams: AnalyticsQueryDto,
    ): Promise<PaymentDistributionDto> {
        const userTenantId = this.getUserTenantId(request);
        this.validateTenantAccess(request, queryParams.tenantId);
        this.validateDateRange(queryParams.startDate, queryParams.endDate);

        return this.analyticsService.getPaymentDistribution(queryParams, userTenantId);
    }

    private getUserTenantId(request: RequestWithUserRoles): string | undefined {
        if (!request.userRoles?.includes(RoleName.SUPER_ADMIN)) {
            return request.tenantId;
        }
        return undefined;
    }

    private validateTenantAccess(request: RequestWithUserRoles, requestedTenantId?: string): void {
        if (requestedTenantId && !request.userRoles?.includes(RoleName.SUPER_ADMIN)) {
            throw new BadRequestException('Only Super Admin can access data from other tenants');
        }
    }

    private validateDateRange(startDate?: string, endDate?: string): void {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format');
            }
            
            if (start > end) {
                throw new BadRequestException('Start date cannot be after end date');
            }
        }
    }
}