import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { AddPaymentMethodDto, UpdatePaymentMethodDto, PaymentMethodDto } from '../dto/payment-method.dto';
import { AddPaymentMethodCommand } from '../commands/add-payment-method.command';
import { UpdatePaymentMethodCommand } from '../commands/update-payment-method.command';
import { RemovePaymentMethodCommand } from '../commands/remove-payment-method.command';
import { GetPaymentMethodsQuery } from '../queries/get-payment-methods.query';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@Controller('payment-methods')
@Authorize(RoleName.ADMIN)
export class PaymentMethodsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Add payment method',
        description: 'Adds a new payment method to the tenant account',
    })
    @ApiBody({ type: AddPaymentMethodDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Payment method added successfully',
        type: PaymentMethodDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async addPaymentMethod(
        @Body() addDto: AddPaymentMethodDto,
        @Req() req: RequestWithTenant,
    ): Promise<PaymentMethodDto> {
        const tenantId = req.tenantId!;
        
        // Ensure the payment method is added to the requesting tenant
        const dto = { ...addDto, tenantId };
        
        return await this.commandBus.execute(new AddPaymentMethodCommand(dto));
    }

    @Get()
    @ApiOperation({
        summary: 'Get payment methods',
        description: 'Retrieves all payment methods for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment methods retrieved successfully',
        type: [PaymentMethodDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getPaymentMethods(@Req() req: RequestWithTenant): Promise<PaymentMethodDto[]> {
        const tenantId = req.tenantId!;
        return await this.queryBus.execute(new GetPaymentMethodsQuery(tenantId));
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update payment method',
        description: 'Updates a payment method (e.g., set as default)',
    })
    @ApiParam({
        name: 'id',
        description: 'Payment method ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdatePaymentMethodDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment method updated successfully',
        type: PaymentMethodDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Payment method not found' })
    async updatePaymentMethod(
        @Param('id') id: string,
        @Body() updateDto: UpdatePaymentMethodDto,
    ): Promise<PaymentMethodDto> {
        return await this.commandBus.execute(new UpdatePaymentMethodCommand(id, updateDto));
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Remove payment method',
        description: 'Removes a payment method from the tenant account',
    })
    @ApiParam({
        name: 'id',
        description: 'Payment method ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Payment method removed successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Payment method not found' })
    async removePaymentMethod(@Param('id') id: string): Promise<void> {
        await this.commandBus.execute(new RemovePaymentMethodCommand(id));
    }
}