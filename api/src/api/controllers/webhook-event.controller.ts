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
    Inject,
    ForbiddenException,
} from '@nestjs/common';

import {
    IWebhookEventCommands,
    WEBHOOK_EVENT_COMMANDS,
} from '../../application/webhooks/interfaces/webhook-event-commands.interface';
import {
    IWebhookEventQueries,
    WEBHOOK_EVENT_QUERIES,
} from '../../application/webhooks/interfaces/webhook-event-queries.interface';
import { CreateWebhookEventDto } from '../../application/webhooks/dto/create-webhook-event.dto';
import { UpdateWebhookEventDto } from '../../application/webhooks/dto/update-webhook-event.dto';
import { WebhookEventDto } from '../../application/webhooks/dto/webhook-event.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from 'src/infrastructure/middleware/request-with-tenant.interface';
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

interface RequestingUserContext {
    isSuperAdmin: boolean;
    tenantId?: string;
}

@ApiTags('Webhook Events')
@ApiBearerAuth()
@Controller('webhook-events')
@Authorize()
export class WebhookEventController {
    constructor(
        @Inject(WEBHOOK_EVENT_COMMANDS) private readonly webhookEventCommands: IWebhookEventCommands,
        @Inject(WEBHOOK_EVENT_QUERIES) private readonly webhookEventQueries: IWebhookEventQueries,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    @Post()
    @Authorize(RoleName.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a webhook event', description: 'Creates a new webhook event type within the tenant' })
    @ApiBody({ type: CreateWebhookEventDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Webhook event created successfully',
        type: WebhookEventDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin role or missing tenant information',
    })
    async create(
        @Body() createWebhookEventDto: CreateWebhookEventDto,
        @Req() req: RequestWithTenant,
    ): Promise<WebhookEventDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.webhookEventCommands.createWebhookEvent(createWebhookEventDto, tenantId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all webhook events',
        description: 'Retrieves all webhook event types based on role permissions',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of webhook events retrieved successfully',
        type: [WebhookEventDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(@Req() req: RequestWithTenant): Promise<WebhookEventDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.webhookEventQueries.findAllWebhookEventsByTenant(tenantId);
    }

    @Get('active')
    @ApiOperation({
        summary: 'Get active webhook events',
        description: 'Retrieves all active webhook event types for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of active webhook events retrieved successfully',
        type: [WebhookEventDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findActive(@Req() req: RequestWithTenant): Promise<WebhookEventDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.webhookEventQueries.findActiveWebhookEventsByTenant(tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get webhook event by ID', description: 'Retrieves a specific webhook event by ID' })
    @ApiParam({
        name: 'id',
        description: 'Webhook Event ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook event retrieved successfully',
        type: WebhookEventDto,
    })
    @ApiNotFoundResponse({ description: 'Webhook event not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<WebhookEventDto> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.webhookEventQueries.findWebhookEventById(id, tenantId);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({ summary: 'Update webhook event', description: 'Updates an existing webhook event' })
    @ApiParam({
        name: 'id',
        description: 'Webhook Event ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateWebhookEventDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Webhook event updated successfully', type: WebhookEventDto })
    @ApiNotFoundResponse({ description: 'Webhook event not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - webhook event not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateWebhookEventDto: UpdateWebhookEventDto,
        @Req() req: RequestWithTenant,
    ): Promise<WebhookEventDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookEventCommands.updateWebhookEvent(id, updateWebhookEventDto, tenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete webhook event', description: 'Deletes a webhook event' })
    @ApiParam({
        name: 'id',
        description: 'Webhook Event ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook event deleted successfully' })
    @ApiNotFoundResponse({ description: 'Webhook event not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookEventCommands.deleteWebhookEvent(id, tenantId, isSuperAdmin);
    }

    @Patch(':id/activate')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Activate webhook event', description: 'Activates a deactivated webhook event' })
    @ApiParam({
        name: 'id',
        description: 'Webhook Event ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook event activated successfully' })
    @ApiNotFoundResponse({ description: 'Webhook event not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async activateWebhookEvent(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookEventCommands.activateWebhookEvent(id, tenantId, isSuperAdmin);
    }

    @Patch(':id/deactivate')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate webhook event', description: 'Deactivates an active webhook event' })
    @ApiParam({
        name: 'id',
        description: 'Webhook Event ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook event deactivated successfully' })
    @ApiNotFoundResponse({ description: 'Webhook event not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async deactivateWebhookEvent(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookEventCommands.deactivateWebhookEvent(id, tenantId, isSuperAdmin);
    }
}