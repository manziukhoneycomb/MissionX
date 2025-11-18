import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    Inject,
    Req,
    BadRequestException,
} from '@nestjs/common';
import {
    IWebhookCommands,
    WEBHOOK_COMMANDS,
} from '../../application/webhooks/interfaces/webhook-commands.interface';
import {
    IWebhookQueries,
    WEBHOOK_QUERIES,
} from '../../application/webhooks/interfaces/webhook-queries.interface';
import { CreateWebhookDto } from '../../application/webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../../application/webhooks/dto/update-webhook.dto';
import { WebhookDto } from '../../application/webhooks/dto/webhook.dto';
import { WebhookEventDto } from '../../application/webhooks/dto/webhook-event.dto';
import { WebhookLogDto } from '../../application/webhooks/dto/webhook-log.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
    ApiBody,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
@Authorize(RoleName.ADMIN, RoleName.USER)
export class WebhookController {
    constructor(
        @Inject(WEBHOOK_COMMANDS) private readonly webhookCommands: IWebhookCommands,
        @Inject(WEBHOOK_QUERIES) private readonly webhookQueries: IWebhookQueries,
    ) {}

    private getTenantId(req: RequestWithTenant): string {
        if (!req.tenantId) {
            throw new BadRequestException('Tenant ID is required');
        }
        return req.tenantId;
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create webhook', description: 'Creates a new webhook for the current tenant' })
    @ApiBody({ type: CreateWebhookDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Webhook created successfully',
        type: WebhookDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async create(@Body() createWebhookDto: CreateWebhookDto, @Req() req: RequestWithTenant): Promise<WebhookDto> {
        const tenantId = this.getTenantId(req);
        return this.webhookCommands.createWebhook(createWebhookDto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all webhooks', description: 'Retrieves all webhooks for the current tenant' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of webhooks retrieved successfully',
        type: [WebhookDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async findAll(@Req() req: RequestWithTenant): Promise<WebhookDto[]> {
        const tenantId = this.getTenantId(req);
        return this.webhookQueries.findAllWebhooks(tenantId);
    }

    @Get('events')
    @ApiOperation({ summary: 'Get available webhook events', description: 'Retrieves all available webhook event types' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of available webhook events',
        type: [WebhookEventDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async getAvailableEvents(@Req() req: RequestWithTenant): Promise<WebhookEventDto[]> {
        const tenantId = this.getTenantId(req);
        return this.webhookQueries.findAvailableEvents(tenantId);
    }

    @Get('logs')
    @ApiOperation({ summary: 'Get webhook logs', description: 'Retrieves webhook delivery logs for the current tenant' })
    @ApiQuery({
        name: 'webhookId',
        required: false,
        description: 'Filter logs by webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of logs to return',
        example: 100,
        type: Number,
    })
    @ApiQuery({
        name: 'offset',
        required: false,
        description: 'Number of logs to skip',
        example: 0,
        type: Number,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook logs retrieved successfully',
        type: [WebhookLogDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async getLogs(
        @Query('webhookId') webhookId?: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @Req() req: RequestWithTenant,
    ): Promise<WebhookLogDto[]> {
        const tenantId = this.getTenantId(req);
        return this.webhookQueries.findWebhookLogs(webhookId, tenantId, limit, offset);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get webhook by ID', description: 'Retrieves a specific webhook by ID' })
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
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<WebhookDto> {
        const tenantId = this.getTenantId(req);
        return this.webhookQueries.findWebhookById(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update webhook', description: 'Updates an existing webhook' })
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
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async update(
        @Param('id') id: string,
        @Body() updateWebhookDto: UpdateWebhookDto,
        @Req() req: RequestWithTenant,
    ): Promise<WebhookDto> {
        const tenantId = this.getTenantId(req);
        return this.webhookCommands.updateWebhook(id, updateWebhookDto, tenantId);
    }

    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Toggle webhook status', description: 'Enables or disables a webhook' })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                isActive: { type: 'boolean', description: 'Whether the webhook should be active' }
            },
            required: ['isActive']
        }
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook status updated successfully',
        type: WebhookDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async toggle(
        @Param('id') id: string,
        @Body() body: { isActive: boolean },
        @Req() req: RequestWithTenant,
    ): Promise<WebhookDto> {
        const tenantId = this.getTenantId(req);
        return this.webhookCommands.toggleWebhook(id, body.isActive, tenantId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete webhook', description: 'Deletes a webhook' })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook deleted successfully' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - insufficient permissions' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const tenantId = this.getTenantId(req);
        return this.webhookCommands.deleteWebhook(id, tenantId);
    }
}