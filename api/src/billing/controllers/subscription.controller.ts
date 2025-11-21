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
import { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionDto } from '../dto/subscription.dto';
import { CreateSubscriptionCommand } from '../commands/create-subscription.command';
import { UpdateSubscriptionCommand } from '../commands/update-subscription.command';
import { CancelSubscriptionCommand } from '../commands/cancel-subscription.command';
import { GetSubscriptionQuery, GetSubscriptionByIdQuery } from '../queries/get-subscription.query';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@Authorize(RoleName.ADMIN)
export class SubscriptionController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create subscription',
        description: 'Creates a new subscription for the tenant',
    })
    @ApiBody({ type: CreateSubscriptionDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Subscription created successfully',
        type: SubscriptionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async createSubscription(
        @Body() createDto: CreateSubscriptionDto,
        @Req() req: RequestWithTenant,
    ): Promise<SubscriptionDto> {
        const tenantId = req.tenantId!;
        
        // Ensure the subscription is created for the requesting tenant
        const dto = { ...createDto, tenantId };
        
        return await this.commandBus.execute(new CreateSubscriptionCommand(dto));
    }

    @Get()
    @ApiOperation({
        summary: 'Get tenant subscription',
        description: 'Retrieves the current subscription for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscription retrieved successfully',
        type: SubscriptionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Subscription not found' })
    async getSubscription(@Req() req: RequestWithTenant): Promise<SubscriptionDto | null> {
        const tenantId = req.tenantId!;
        return await this.queryBus.execute(new GetSubscriptionQuery(tenantId));
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get subscription by ID',
        description: 'Retrieves a specific subscription by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Subscription ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscription retrieved successfully',
        type: SubscriptionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Subscription not found' })
    async getSubscriptionById(@Param('id') id: string): Promise<SubscriptionDto> {
        return await this.queryBus.execute(new GetSubscriptionByIdQuery(id));
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update subscription',
        description: 'Updates an existing subscription (e.g., change plan)',
    })
    @ApiParam({
        name: 'id',
        description: 'Subscription ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateSubscriptionDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Subscription updated successfully',
        type: SubscriptionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Subscription not found' })
    async updateSubscription(
        @Param('id') id: string,
        @Body() updateDto: UpdateSubscriptionDto,
    ): Promise<SubscriptionDto> {
        return await this.commandBus.execute(new UpdateSubscriptionCommand(id, updateDto));
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Cancel subscription',
        description: 'Cancels a subscription (by default at period end)',
    })
    @ApiParam({
        name: 'id',
        description: 'Subscription ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({
        required: false,
        schema: {
            type: 'object',
            properties: {
                cancelAtPeriodEnd: {
                    type: 'boolean',
                    default: true,
                    description: 'Whether to cancel at the end of the current period or immediately',
                },
            },
        },
    })
    @ApiNoContentResponse({ description: 'Subscription canceled successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    @ApiNotFoundResponse({ description: 'Subscription not found' })
    async cancelSubscription(
        @Param('id') id: string,
        @Body() cancelDto?: { cancelAtPeriodEnd?: boolean },
    ): Promise<void> {
        const cancelAtPeriodEnd = cancelDto?.cancelAtPeriodEnd ?? true;
        await this.commandBus.execute(new CancelSubscriptionCommand(id, cancelAtPeriodEnd));
    }
}