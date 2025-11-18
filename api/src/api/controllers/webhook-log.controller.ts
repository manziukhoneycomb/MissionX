import {
    Controller,
    Get,
    Param,
    Req,
    Query,
    HttpStatus,
    Inject,
    ForbiddenException,
    ParseIntPipe,
} from '@nestjs/common';

import {
    IWebhookLogQueries,
    WEBHOOK_LOG_QUERIES,
} from '../../application/webhooks/interfaces/webhook-log-queries.interface';
import { WebhookLogDto } from '../../application/webhooks/dto/webhook-log.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from 'src/infrastructure/middleware/request-with-tenant.interface';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';

interface RequestingUserContext {
    isSuperAdmin: boolean;
    tenantId?: string;
}

@ApiTags('Webhook Logs')
@ApiBearerAuth()
@Controller('webhook-logs')
@Authorize()
export class WebhookLogController {
    constructor(
        @Inject(WEBHOOK_LOG_QUERIES) private readonly webhookLogQueries: IWebhookLogQueries,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    @Get()
    @ApiOperation({
        summary: 'Get all webhook logs',
        description: 'Retrieves all webhook logs for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of webhook logs retrieved successfully',
        type: [WebhookLogDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findAll(@Req() req: RequestWithTenant): Promise<WebhookLogDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.webhookLogQueries.findAllWebhookLogsByTenant(tenantId);
    }

    @Get('failed')
    @ApiOperation({
        summary: 'Get failed webhook logs',
        description: 'Retrieves all failed webhook delivery logs for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of failed webhook logs retrieved successfully',
        type: [WebhookLogDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findFailed(@Req() req: RequestWithTenant): Promise<WebhookLogDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.webhookLogQueries.findFailedWebhookLogs(tenantId);
    }

    @Get('recent')
    @ApiOperation({
        summary: 'Get recent webhook logs',
        description: 'Retrieves recent webhook logs for the tenant with optional limit',
    })
    @ApiQuery({
        name: 'limit',
        description: 'Maximum number of logs to return',
        example: 100,
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of recent webhook logs retrieved successfully',
        type: [WebhookLogDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - missing tenant information' })
    async findRecent(
        @Req() req: RequestWithTenant,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ): Promise<WebhookLogDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        if (tenantId === undefined) {
            throw new ForbiddenException('User tenant information is missing.');
        }

        return this.webhookLogQueries.findRecentWebhookLogs(tenantId, limit);
    }

    @Get('webhook/:webhookId')
    @ApiOperation({
        summary: 'Get webhook logs by webhook ID',
        description: 'Retrieves all logs for a specific webhook',
    })
    @ApiParam({
        name: 'webhookId',
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of webhook logs for the specified webhook retrieved successfully',
        type: [WebhookLogDto],
    })
    @ApiNotFoundResponse({ description: 'Webhook not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - webhook not in same tenant' })
    async findByWebhookId(
        @Param('webhookId') webhookId: string,
        @Req() req: RequestWithTenant,
    ): Promise<WebhookLogDto[]> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.webhookLogQueries.findWebhookLogsByWebhookId(webhookId, tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get webhook log by ID', description: 'Retrieves a specific webhook log by ID' })
    @ApiParam({
        name: 'id',
        description: 'Webhook Log ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook log retrieved successfully',
        type: WebhookLogDto,
    })
    @ApiNotFoundResponse({ description: 'Webhook log not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - webhook log not in same tenant' })
    async findOne(@Param('id') id: string, @Req() req: RequestWithTenant): Promise<WebhookLogDto> {
        const { tenantId }: RequestingUserContext = this._getRequestingUserContext(req);

        return this.webhookLogQueries.findWebhookLogById(id, tenantId);
    }
}