import {
    Controller,
    Get,
    Query,
    Req,
    HttpStatus,
    Inject,
    Logger,
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
import { ComprehensiveAnalyticsDto } from '../../application/analytics/dto/analytics-response.dto';
import { RevenueAnalyticsDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto } from '../../application/analytics/dto/payment-distribution.dto';
import { AnalyticsQueryDto, DateRange, TimeGroup } from '../../application/analytics/dto/analytics-query.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(@Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService) {}

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
        description: 'Start date for analytics (ISO format: YYYY-MM-DD)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (ISO format: YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRange,
        description: 'Predefined date range',
    })
    @ApiQuery({
        name: 'groupBy',
        required: false,
        enum: TimeGroup,
        description: 'How to group time-based data',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Limit for top results (1-100)',
        example: 10,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Comprehensive analytics data retrieved successfully',
        type: ComprehensiveAnalyticsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getComprehensiveAnalytics(
        @Req() request: RequestWithTenant,
        @Query() query: AnalyticsQueryDto,
    ): Promise<ComprehensiveAnalyticsDto> {
        this.logger.log('Getting comprehensive analytics data');

        try {
            this.validateQuery(query);
            const tenantId = request.tenantId!;
            return await this.analyticsService.getComprehensiveAnalytics(tenantId, query);
        } catch (error) {
            this.logger.error('Failed to get comprehensive analytics', error);
            throw error;
        }
    }

    @Get('revenue')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue analytics',
        description: 'Retrieves revenue trends, growth metrics, and revenue breakdown data',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRange,
        description: 'Predefined date range',
    })
    @ApiQuery({
        name: 'groupBy',
        required: false,
        enum: TimeGroup,
        description: 'How to group time-based data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue analytics retrieved successfully',
        type: RevenueAnalyticsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getRevenueAnalytics(
        @Req() request: RequestWithTenant,
        @Query() query: AnalyticsQueryDto,
    ): Promise<RevenueAnalyticsDto> {
        this.logger.log('Getting revenue analytics');

        try {
            this.validateQuery(query);
            const tenantId = request.tenantId!;
            return await this.analyticsService.getRevenueAnalytics(tenantId, query);
        } catch (error) {
            this.logger.error('Failed to get revenue analytics', error);
            throw error;
        }
    }

    @Get('tenants')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves tenant-specific performance data including invoice counts, revenue, and payment timeliness',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRange,
        description: 'Predefined date range',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Limit for top tenants (1-100)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: TenantMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getTenantMetrics(
        @Req() request: RequestWithTenant,
        @Query() query: AnalyticsQueryDto,
    ): Promise<TenantMetricsDto> {
        this.logger.log('Getting tenant metrics');

        try {
            this.validateQuery(query);
            const tenantId = request.tenantId!;
            return await this.analyticsService.getTenantMetrics(tenantId, query);
        } catch (error) {
            this.logger.error('Failed to get tenant metrics', error);
            throw error;
        }
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves invoice status breakdown, aging analysis, and collection metrics',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRange,
        description: 'Predefined date range',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getInvoiceStatusOverview(
        @Req() request: RequestWithTenant,
        @Query() query: AnalyticsQueryDto,
    ): Promise<InvoiceStatusOverviewDto> {
        this.logger.log('Getting invoice status overview');

        try {
            this.validateQuery(query);
            const tenantId = request.tenantId!;
            return await this.analyticsService.getInvoiceStatusOverview(tenantId, query);
        } catch (error) {
            this.logger.error('Failed to get invoice status overview', error);
            throw error;
        }
    }

    @Get('payment-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution analytics',
        description: 'Retrieves payment distribution by customer, amount ranges, and statistical summaries',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (ISO format: YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRange,
        description: 'Predefined date range',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Limit for top customers (1-100)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution retrieved successfully',
        type: PaymentDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getPaymentDistribution(
        @Req() request: RequestWithTenant,
        @Query() query: AnalyticsQueryDto,
    ): Promise<PaymentDistributionDto> {
        this.logger.log('Getting payment distribution');

        try {
            this.validateQuery(query);
            const tenantId = request.tenantId!;
            return await this.analyticsService.getPaymentDistribution(tenantId, query);
        } catch (error) {
            this.logger.error('Failed to get payment distribution', error);
            throw error;
        }
    }

    private validateQuery(query: AnalyticsQueryDto): void {
        // Validate date range
        if (query.startDate && query.endDate) {
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
            }

            if (startDate >= endDate) {
                throw new BadRequestException('Start date must be before end date.');
            }

            // Prevent queries for more than 2 years to avoid performance issues
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

            if (startDate < twoYearsAgo) {
                throw new BadRequestException('Date range cannot exceed 2 years from current date.');
            }
        }

        // Validate limit
        if (query.limit !== undefined && (query.limit < 1 || query.limit > 100)) {
            throw new BadRequestException('Limit must be between 1 and 100.');
        }

        // If using custom date range, both dates are required
        if (query.dateRange === DateRange.CUSTOM && (!query.startDate || !query.endDate)) {
            throw new BadRequestException('Both startDate and endDate are required when using custom date range.');
        }
    }
}