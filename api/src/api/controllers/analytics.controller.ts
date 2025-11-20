import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { AnalyticsService } from '../../application/analytics/analytics.service';
import { AnalyticsSummary, AnalyticsQueryParams } from '../../application/analytics/dto/analytics.dto';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @Authorize([RoleName.ADMIN, RoleName.SUPER_ADMIN])
  async getAnalyticsSummary(
    @Req() request: RequestWithTenant,
    @Query() queryParams: AnalyticsQueryParams,
  ): Promise<AnalyticsSummary> {
    const tenantId = request.user?.role?.name === RoleName.SUPER_ADMIN ? 'all' : request.tenant.id;
    
    return this.analyticsService.getAnalyticsSummary(tenantId, queryParams);
  }
}