import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { BillingOverviewDto, BillingDetailsDto, UpdateBillingDetailsDto } from '../dto/billing-details.dto';
import { GetBillingOverviewQuery } from '../queries/get-billing-overview.query';
import { StripeIntegrationService } from '../services/stripe-integration.service';
import { BillingRepository } from '../repositories/billing.repository';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
@Authorize(RoleName.ADMIN)
export class BillingController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly stripeIntegrationService: StripeIntegrationService,
        private readonly billingRepository: BillingRepository,
    ) {}

    @Get('overview')
    @ApiOperation({
        summary: 'Get billing overview',
        description: 'Retrieves complete billing overview including subscription, payment methods, invoices, and usage metrics for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Billing overview retrieved successfully',
        type: BillingOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getBillingOverview(@Req() req: RequestWithTenant): Promise<BillingOverviewDto> {
        const tenantId = req.tenantId!;
        return await this.queryBus.execute(new GetBillingOverviewQuery(tenantId));
    }

    @Get('details')
    @ApiOperation({
        summary: 'Get billing details',
        description: 'Retrieves billing details including customer information and billing address',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Billing details retrieved successfully',
        type: BillingDetailsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Billing details not found' })
    async getBillingDetails(@Req() req: RequestWithTenant): Promise<BillingDetailsDto | null> {
        const tenantId = req.tenantId!;
        const billingDetails = await this.billingRepository.findBillingDetailsByTenantId(tenantId);
        
        if (!billingDetails) {
            return null;
        }

        return this.mapBillingDetailsToDto(billingDetails);
    }

    @Post('setup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Setup billing for tenant',
        description: 'Creates initial billing setup with Stripe customer for the tenant',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'billing@company.com' },
                name: { type: 'string', example: 'Acme Corporation' }
            },
            required: ['email']
        }
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Billing setup completed successfully',
        type: BillingDetailsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async setupBilling(
        @Body() setupDto: { email: string; name?: string },
        @Req() req: RequestWithTenant,
    ): Promise<BillingDetailsDto> {
        const tenantId = req.tenantId!;
        return await this.stripeIntegrationService.createCustomerForTenant(
            tenantId,
            setupDto.email,
            setupDto.name
        );
    }

    @Patch('details')
    @ApiOperation({
        summary: 'Update billing details',
        description: 'Updates billing details including customer information and billing address',
    })
    @ApiBody({ type: UpdateBillingDetailsDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Billing details updated successfully',
        type: BillingDetailsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Billing details not found' })
    async updateBillingDetails(
        @Body() updateDto: UpdateBillingDetailsDto,
        @Req() req: RequestWithTenant,
    ): Promise<BillingDetailsDto> {
        const tenantId = req.tenantId!;
        return await this.stripeIntegrationService.updateBillingDetails(tenantId, updateDto);
    }

    private mapBillingDetailsToDto(billingDetails: any): BillingDetailsDto {
        const dto = new BillingDetailsDto();
        dto.tenantId = billingDetails.tenantId;
        dto.stripeCustomerId = billingDetails.stripeCustomerId;
        dto.billingEmail = billingDetails.billingEmail;
        dto.companyName = billingDetails.companyName;
        dto.taxId = billingDetails.taxId;
        dto.addressLine1 = billingDetails.addressLine1;
        dto.addressLine2 = billingDetails.addressLine2;
        dto.city = billingDetails.city;
        dto.state = billingDetails.state;
        dto.postalCode = billingDetails.postalCode;
        dto.country = billingDetails.country;
        dto.createdAt = billingDetails.createdAt;
        dto.updatedAt = billingDetails.updatedAt;
        return dto;
    }
}