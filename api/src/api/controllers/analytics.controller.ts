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
import {
    RevenueTrendResponseDto,
    TopCustomerDto,
} from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsResponseDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusResponseDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionResponseDto } from '../../application/analytics/dto/payment-distribution.dto';
import { DateRangeDto, AnalyticsQueryDto } from '../../application/analytics/dto/analytics-response.dto';

interface RequestWithUserRoles extends RequestWithTenant {
    userRoles?: RoleName[];
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(@Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService) {}

    @Get('revenue-trends')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue trends',
        description: 'Retrieves revenue trends over time with configurable grouping (month/quarter/year)',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'groupBy',
        required: false,
        enum: ['month', 'quarter', 'year'],
        description: 'Group results by time period',
        example: 'month',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trends retrieved successfully',
        type: RevenueTrendResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getRevenueTrends(
        @Req() request: RequestWithUserRoles,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('groupBy') groupBy?: 'month' | 'quarter' | 'year',
    ): Promise<RevenueTrendResponseDto> {
        this.logger.log(`Getting revenue trends from ${startDate} to ${endDate}, groupBy: ${groupBy}`);

        if (!startDate || !endDate) {
            throw new BadRequestException('startDate and endDate are required');
        }

        if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        const dateRange: DateRangeDto = { startDate, endDate };
        const tenantId = this.getTenantIdForUser(request);

        return this.analyticsService.getRevenueTrends(tenantId, dateRange, groupBy || 'month');
    }

    @Get('top-customers')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get top customers by revenue',
        description: 'Retrieves top customers ranked by total revenue in the specified date range',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of top customers to return',
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
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('limit') limit?: number,
    ): Promise<TopCustomerDto[]> {
        this.logger.log(`Getting top customers from ${startDate} to ${endDate}, limit: ${limit}`);

        if (!startDate || !endDate) {
            throw new BadRequestException('startDate and endDate are required');
        }

        if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        const dateRange: DateRangeDto = { startDate, endDate };
        const tenantId = this.getTenantIdForUser(request);

        return this.analyticsService.getTopCustomers(tenantId, dateRange, limit || 10);
    }

    @Get('tenant-metrics')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves performance metrics for tenants including invoice counts, revenue, and payment timeliness',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
        example: 10,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: TenantMetricsResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTenantMetrics(
        @Req() request: RequestWithUserRoles,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<TenantMetricsResponseDto> {
        this.logger.log(`Getting tenant metrics from ${startDate} to ${endDate}`);

        if (!startDate || !endDate) {
            throw new BadRequestException('startDate and endDate are required');
        }

        if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        const query: AnalyticsQueryDto = {
            startDate,
            endDate,
            page: page && page > 0 ? page : undefined,
            limit: limit && limit > 0 ? limit : undefined,
        };
        const tenantId = this.getTenantIdForUser(request);

        return this.analyticsService.getTenantMetrics(tenantId, query);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves overview of invoice statuses including paid/unpaid/overdue counts and aging analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getInvoiceStatusOverview(
        @Req() request: RequestWithUserRoles,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ): Promise<InvoiceStatusResponseDto> {
        this.logger.log(`Getting invoice status overview from ${startDate} to ${endDate}`);

        if (!startDate || !endDate) {
            throw new BadRequestException('startDate and endDate are required');
        }

        if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        const dateRange: DateRangeDto = { startDate, endDate };
        const tenantId = this.getTenantIdForUser(request);

        return this.analyticsService.getInvoiceStatusOverview(tenantId, dateRange);
    }

    @Get('payment-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution analysis',
        description: 'Retrieves payment distribution by methods and amount ranges',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution retrieved successfully',
        type: PaymentDistributionResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getPaymentDistribution(
        @Req() request: RequestWithUserRoles,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ): Promise<PaymentDistributionResponseDto> {
        this.logger.log(`Getting payment distribution from ${startDate} to ${endDate}`);

        if (!startDate || !endDate) {
            throw new BadRequestException('startDate and endDate are required');
        }

        if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        const dateRange: DateRangeDto = { startDate, endDate };
        const tenantId = this.getTenantIdForUser(request);

        return this.analyticsService.getPaymentDistribution(tenantId, dateRange);
    }

    private isValidDate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) {
            return false;
        }
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
    }

    private getTenantIdForUser(request: RequestWithUserRoles): string | null {
        const userRoles = request.userRoles || [];
        const isSuperAdmin = userRoles.includes(RoleName.SUPER_ADMIN);

        if (isSuperAdmin) {
            return null;
        }

        return request.tenantId || null;
    }
}