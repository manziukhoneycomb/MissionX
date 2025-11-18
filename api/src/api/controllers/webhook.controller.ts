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

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
@Authorize()
export class WebhookController {
    constructor(
        @Inject(WEBHOOK_COMMANDS) private readonly webhookCommands: IWebhookCommands,
        @Inject(WEBHOOK_QUERIES) private readonly webhookQueries: IWebhookQueries,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    @Post()
    @Authorize(RoleName.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a webhook', description: 'Creates a new webhook within the tenant' })
    @ApiBody({ type: CreateWebhookDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Webhook created successfully',
        type: WebhookDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin role or missing tenant information',
    })
    async create(
        @Body() createWebhookDto: CreateWebhookDto,
        @Req() req: RequestWithTenant,
    ): Promise<WebhookDto> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.webhookCommands.createWebhook(createWebhookDto, tenantId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all webhooks',
        description: 'Retrieves all webhooks based on role permissions',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of webhooks retrieved successfully',
        type: [WebhookDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(@Req() req: RequestWithTenant): Promise<WebhookDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.webhookQueries.findAllWebhooksByTenant(tenantId);
    }

    @Get('active')
    @ApiOperation({
        summary: 'Get active webhooks',
        description: 'Retrieves all active webhooks for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of active webhooks retrieved successfully',
        type: [WebhookDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findActive(@Req() req: RequestWithTenant): Promise<WebhookDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.webhookQueries.findActiveWebhooksByTenant(tenantId);
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
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<WebhookDto> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.webhookQueries.findWebhookById(id, tenantId);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN)
    @ApiOperation({ summary: 'Update webhook', description: 'Updates an existing webhook' })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateWebhookDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Webhook updated successfully', type: WebhookDto })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - webhook not in same tenant' })
    async update(
        @Param('id') id: string,
        @Body() updateWebhookDto: UpdateWebhookDto,
        @Req() req: RequestWithTenant,
    ): Promise<WebhookDto> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookCommands.updateWebhook(id, updateWebhookDto, tenantId, isSuperAdmin);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
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
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async remove(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookCommands.deleteWebhook(id, tenantId, isSuperAdmin);
    }

    @Patch(':id/activate')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Activate webhook', description: 'Activates a deactivated webhook' })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook activated successfully' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async activateWebhook(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookCommands.activateWebhook(id, tenantId, isSuperAdmin);
    }

    @Patch(':id/deactivate')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate webhook', description: 'Deactivates an active webhook' })
    @ApiParam({
        name: 'id',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Webhook deactivated successfully' })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async deactivateWebhook(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<void> {
        const { isSuperAdmin, tenantId }: RequestingUserContext =
            this._getRequestingUserContext(req);

        return this.webhookCommands.deactivateWebhook(id, tenantId, isSuperAdmin);
    }
}