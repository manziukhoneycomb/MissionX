import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
    Req,
    Query,
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
    ApiQuery,
} from '@nestjs/swagger';
import { IWebhookService, WEBHOOK_SERVICE } from '../../application/webhooks/interfaces/webhook.service.interface';
import { WebhookDto } from '../../application/webhooks/dto/webhook.dto';
import { CreateWebhookDto } from '../../application/webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../../application/webhooks/dto/update-webhook.dto';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
@Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
export class WebhookController {
    constructor(
        @Inject(WEBHOOK_SERVICE) private readonly webhookService: IWebhookService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create webhook',
        description: 'Creates a new webhook configuration',
    })
    @ApiBody({ type: CreateWebhookDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Webhook created successfully',
        type: WebhookDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async create(
        @Body() createWebhookDto: CreateWebhookDto,
        @Req() request: RequestWithTenant,
    ): Promise<WebhookDto> {
        const tenantId = request.tenantId!;
        return this.webhookService.create(createWebhookDto, tenantId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all webhooks',
        description: 'Retrieves all webhooks for the current tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of webhooks retrieved successfully',
        type: [WebhookDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async findAll(@Req() request: RequestWithTenant): Promise<WebhookDto[]> {
        const tenantId = request.tenantId!;
        return this.webhookService.findAll(tenantId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get webhook by ID',
        description: 'Retrieves a specific webhook by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook retrieved successfully',
        type: WebhookDto,
    })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async findOne(
        @Param('id') id: string,
        @Req() request: RequestWithTenant,
    ): Promise<WebhookDto> {
        const tenantId = request.tenantId!;
        return this.webhookService.findById(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update webhook',
        description: 'Updates an existing webhook configuration',
    })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateWebhookDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook updated successfully',
        type: WebhookDto,
    })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async update(
        @Param('id') id: string,
        @Body() updateWebhookDto: UpdateWebhookDto,
        @Req() request: RequestWithTenant,
    ): Promise<WebhookDto> {
        const tenantId = request.tenantId!;
        return this.webhookService.update(id, updateWebhookDto, tenantId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete webhook',
        description: 'Deletes a webhook configuration',
    })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook deleted successfully' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async remove(
        @Param('id') id: string,
        @Req() request: RequestWithTenant,
    ): Promise<void> {
        const tenantId = request.tenantId!;
        return this.webhookService.delete(id, tenantId);
    }

    @Post(':id/activate')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Activate webhook',
        description: 'Activates a webhook to start receiving events',
    })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook activated successfully' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async activate(
        @Param('id') id: string,
        @Req() request: RequestWithTenant,
    ): Promise<void> {
        const tenantId = request.tenantId!;
        return this.webhookService.activate(id, tenantId);
    }

    @Post(':id/deactivate')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Deactivate webhook',
        description: 'Deactivates a webhook to stop receiving events',
    })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook deactivated successfully' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async deactivate(
        @Param('id') id: string,
        @Req() request: RequestWithTenant,
    ): Promise<void> {
        const tenantId = request.tenantId!;
        return this.webhookService.deactivate(id, tenantId);
    }

    @Get(':id/logs')
    @ApiOperation({
        summary: 'Get webhook delivery logs',
        description: 'Retrieves delivery logs for a specific webhook',
    })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of logs to retrieve (default: 50)',
    })
    @ApiQuery({
        name: 'offset',
        required: false,
        type: Number,
        description: 'Number of logs to skip (default: 0)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook delivery logs retrieved successfully',
        type: [WebhookLog],
    })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getLogs(
        @Param('id') id: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @Req() request: RequestWithTenant,
    ): Promise<WebhookLog[]> {
        const tenantId = request.tenantId!;
        return this.webhookService.getDeliveryLogs(id, tenantId, limit, offset);
    }
}