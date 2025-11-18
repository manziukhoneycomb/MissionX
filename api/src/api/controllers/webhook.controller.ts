import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    Req,
    HttpStatus,
    HttpCode,
    Inject,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { WebhookDto } from '../../application/webhooks/dto/webhook.dto';
import { CreateWebhookDto } from '../../application/webhooks/dto/create-webhook.dto';
import { UpdateWebhookDto } from '../../application/webhooks/dto/update-webhook.dto';
import { WebhookLogDto } from '../../application/webhooks/dto/webhook-log.dto';
import {
    PaginatedResponseDto,
    PaginationParamsDto,
} from '../../application/invoices/dto/pagination.dto';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    WEBHOOK_SERVICE,
    IWebhookService,
} from '../../application/webhooks/interfaces/webhook.service.interface';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhookController {
    constructor(@Inject(WEBHOOK_SERVICE) private readonly webhookService: IWebhookService) {}

    @Get()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get all webhooks',
        description: 'Retrieves all webhooks for the tenant with pagination',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (starts from 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of webhooks retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async findAll(
        @Req() request: RequestWithTenant,
        @Query() paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<WebhookDto>> {
        const tenantId = request.tenantId!;
        return this.webhookService.findAll(tenantId, paginationParams);
    }

    @Get(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get webhook by ID',
        description: 'Retrieves a specific webhook by ID',
    })
    @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook retrieved successfully',
        type: WebhookDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Webhook not found',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async findOne(@Param('id') id: string, @Req() request: RequestWithTenant): Promise<WebhookDto> {
        const tenantId = request.tenantId!;
        return this.webhookService.findById(id, tenantId);
    }

    @Post()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Create a new webhook',
        description: 'Creates a new webhook configuration',
    })
    @ApiBody({
        type: CreateWebhookDto,
        description: 'Webhook configuration data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Webhook created successfully',
        type: WebhookDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid webhook data',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async create(
        @Body() createWebhookDto: CreateWebhookDto,
        @Req() request: RequestWithTenant,
    ): Promise<WebhookDto> {
        const tenantId = request.tenantId!;
        return this.webhookService.create(createWebhookDto, tenantId);
    }

    @Put(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Update webhook',
        description: 'Updates an existing webhook configuration',
    })
    @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
    @ApiBody({
        type: UpdateWebhookDto,
        description: 'Updated webhook configuration data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook updated successfully',
        type: WebhookDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Webhook not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid webhook data',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
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
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Delete webhook',
        description: 'Deletes a webhook configuration',
    })
    @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
    @ApiNoContentResponse({ description: 'Webhook deleted successfully' })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Webhook not found',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async remove(@Param('id') id: string, @Req() request: RequestWithTenant): Promise<void> {
        const tenantId = request.tenantId!;
        await this.webhookService.remove(id, tenantId);
    }

    @Put(':id/toggle')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Toggle webhook status',
        description: 'Toggles webhook active/inactive status',
    })
    @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook status toggled successfully',
        type: WebhookDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Webhook not found',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async toggleStatus(@Param('id') id: string, @Req() request: RequestWithTenant): Promise<WebhookDto> {
        const tenantId = request.tenantId!;
        return this.webhookService.toggleStatus(id, tenantId);
    }

    @Get(':id/logs')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get webhook delivery logs',
        description: 'Retrieves delivery logs for a specific webhook',
    })
    @ApiParam({ name: 'id', description: 'Webhook ID', type: String })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (starts from 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook logs retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Webhook not found',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getLogs(
        @Param('id') id: string,
        @Req() request: RequestWithTenant,
        @Query() paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<WebhookLogDto>> {
        const tenantId = request.tenantId!;
        return this.webhookService.getLogs(id, tenantId, paginationParams);
    }
}