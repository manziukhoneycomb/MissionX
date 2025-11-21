import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    HttpCode,
    HttpStatus,
    Inject,
    ForbiddenException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiBody,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { IBillingService, BILLING_SERVICE } from '../../application/billing/interfaces/billing.service.interface';
import {
    BillingInfoDto,
    AddPaymentMethodDto,
    PaymentMethodDto,
    UpdateSubscriptionDto,
    SubscriptionDto,
} from '../../application/billing/dto/billing.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
@Authorize(RoleName.ADMIN)
export class BillingController {
    constructor(
        @Inject(BILLING_SERVICE) private readonly billingService: IBillingService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Get billing information',
        description: 'Retrieves billing information for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Billing information retrieved successfully',
        type: BillingInfoDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async getBillingInfo(@Req() req: RequestWithTenant): Promise<BillingInfoDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.billingService.getBillingInfo(tenantId);
    }

    @Post('payment-methods')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Add payment method',
        description: 'Adds a new payment method for the tenant',
    })
    @ApiBody({ type: AddPaymentMethodDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Payment method added successfully',
        type: PaymentMethodDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async addPaymentMethod(
        @Body() addPaymentMethodDto: AddPaymentMethodDto,
        @Req() req: RequestWithTenant,
    ): Promise<PaymentMethodDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.billingService.addPaymentMethod(tenantId, addPaymentMethodDto);
    }

    @Delete('payment-methods/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove payment method',
        description: 'Removes a payment method from the tenant',
    })
    @ApiParam({
        name: 'id',
        description: 'Payment method ID',
        example: 'pm_1234567890',
    })
    @ApiNoContentResponse({ description: 'Payment method removed successfully' })
    @ApiNotFoundResponse({ description: 'Payment method not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async removePaymentMethod(
        @Param('id') paymentMethodId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.billingService.removePaymentMethod(tenantId, paymentMethodId);
    }

    @Patch('payment-methods/:id/default')
    @ApiOperation({
        summary: 'Set default payment method',
        description: 'Sets a payment method as the default for the tenant',
    })
    @ApiParam({
        name: 'id',
        description: 'Payment method ID',
        example: 'pm_1234567890',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Default payment method updated successfully',
        type: PaymentMethodDto,
    })
    @ApiNotFoundResponse({ description: 'Payment method not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async setDefaultPaymentMethod(
        @Param('id') paymentMethodId: string,
        @Req() req: RequestWithTenant,
    ): Promise<PaymentMethodDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.billingService.setDefaultPaymentMethod(tenantId, paymentMethodId);
    }

    @Patch('subscription')
    @ApiOperation({
        summary: 'Update subscription',
        description: 'Updates the tenant subscription plan',
    })
    @ApiBody({ type: UpdateSubscriptionDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscription updated successfully',
        type: SubscriptionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async updateSubscription(
        @Body() updateSubscriptionDto: UpdateSubscriptionDto,
        @Req() req: RequestWithTenant,
    ): Promise<SubscriptionDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.billingService.updateSubscription(tenantId, updateSubscriptionDto);
    }
}