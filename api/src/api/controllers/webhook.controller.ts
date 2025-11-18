import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    BadRequestException,
    UnauthorizedException,
    Param,
    Get,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiHeader,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AzureWorkItemWebhookDto, WebhookValidationDto } from '../../infrastructure/azure-devops/dto/webhook.dto';
import { AzureDevOpsSyncService } from '../../application/tasks/sync/azure-devops-sync.service';
import * as crypto from 'crypto';

@ApiTags('Webhooks')
@Controller('webhooks/azure-devops')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly syncService: AzureDevOpsSyncService) {}

    @Get('validate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Validate Azure DevOps webhook',
        description: 'Validates Azure DevOps webhook subscription during setup',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook validation successful',
        schema: {
            type: 'object',
            properties: {
                validationToken: { type: 'string' },
            },
        },
    })
    validateWebhook(@Query('validationToken') validationToken: string): { validationToken: string } {
        if (!validationToken) {
            throw new BadRequestException('Validation token is required');
        }

        this.logger.log(`Webhook validation requested with token: ${validationToken}`);
        
        return { validationToken };
    }

    @Post(':tenantId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Azure DevOps webhook endpoint',
        description: 'Receives webhook notifications from Azure DevOps for work item changes',
    })
    @ApiParam({
        name: 'tenantId',
        description: 'Tenant ID for webhook processing',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: AzureWorkItemWebhookDto })
    @ApiHeader({
        name: 'x-vss-signature',
        description: 'Azure DevOps webhook signature for verification',
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Invalid webhook payload' })
    @ApiUnauthorizedResponse({ description: 'Webhook signature verification failed' })
    async handleWebhook(
        @Param('tenantId') tenantId: string,
        @Body() payload: AzureWorkItemWebhookDto,
        @Headers('x-vss-signature') signature?: string,
    ): Promise<{ success: boolean; message: string }> {
        try {
            this.logger.log(
                `Received webhook for tenant ${tenantId}, event: ${payload.eventType}, work item: ${payload.resource?.id}`,
            );

            if (!this.isValidWebhookPayload(payload)) {
                throw new BadRequestException('Invalid webhook payload structure');
            }

            if (signature && !this.verifyWebhookSignature(payload, signature)) {
                throw new UnauthorizedException('Webhook signature verification failed');
            }

            await this.processWebhookEvent(tenantId, payload);

            return {
                success: true,
                message: 'Webhook processed successfully',
            };
        } catch (error) {
            this.logger.error(
                `Failed to process webhook for tenant ${tenantId}: ${error.message}`,
                error.stack,
            );

            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }

            return {
                success: false,
                message: `Failed to process webhook: ${error.message}`,
            };
        }
    }

    private isValidWebhookPayload(payload: AzureWorkItemWebhookDto): boolean {
        return !!(
            payload &&
            payload.eventType &&
            payload.resource &&
            payload.resource.id &&
            payload.resource.url
        );
    }

    private verifyWebhookSignature(payload: AzureWorkItemWebhookDto, signature: string): boolean {
        try {
            const webhookSecret = process.env.AZURE_DEVOPS_WEBHOOK_SECRET;
            
            if (!webhookSecret) {
                this.logger.warn('Webhook secret not configured, skipping signature verification');
                return true;
            }

            const payloadString = JSON.stringify(payload);
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(payloadString)
                .digest('hex');

            const signatureBuffer = Buffer.from(signature.replace('sha256=', ''), 'hex');
            const expectedBuffer = Buffer.from(expectedSignature, 'hex');

            return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
        } catch (error) {
            this.logger.error(`Webhook signature verification error: ${error.message}`);
            return false;
        }
    }

    private async processWebhookEvent(tenantId: string, payload: AzureWorkItemWebhookDto): Promise<void> {
        const { eventType, resource } = payload;
        const workItemId = resource.id;

        switch (eventType) {
            case 'workitem.created':
                await this.handleWorkItemCreated(tenantId, workItemId);
                break;
            
            case 'workitem.updated':
                await this.handleWorkItemUpdated(tenantId, workItemId);
                break;
            
            case 'workitem.deleted':
                await this.handleWorkItemDeleted(tenantId, workItemId);
                break;
            
            default:
                this.logger.debug(`Unhandled webhook event type: ${eventType}`);
                break;
        }
    }

    private async handleWorkItemCreated(tenantId: string, workItemId: number): Promise<void> {
        try {
            const result = await this.syncService.syncTaskFromAzure(tenantId, workItemId);
            
            if (result.success) {
                this.logger.log(`Successfully created task from Azure work item ${workItemId}: ${result.taskId}`);
            } else {
                this.logger.warn(`Failed to create task from Azure work item ${workItemId}: ${result.message}`);
            }
        } catch (error) {
            this.logger.error(`Error handling work item created event: ${error.message}`, error.stack);
        }
    }

    private async handleWorkItemUpdated(tenantId: string, workItemId: number): Promise<void> {
        try {
            const result = await this.syncService.syncTaskFromAzure(tenantId, workItemId);
            
            if (result.success) {
                this.logger.log(`Successfully updated task from Azure work item ${workItemId}: ${result.taskId}`);
            } else {
                this.logger.warn(`Failed to update task from Azure work item ${workItemId}: ${result.message}`);
            }
        } catch (error) {
            this.logger.error(`Error handling work item updated event: ${error.message}`, error.stack);
        }
    }

    private async handleWorkItemDeleted(tenantId: string, workItemId: number): Promise<void> {
        try {
            this.logger.log(`Work item ${workItemId} was deleted in Azure DevOps`);
        } catch (error) {
            this.logger.error(`Error handling work item deleted event: ${error.message}`, error.stack);
        }
    }
}