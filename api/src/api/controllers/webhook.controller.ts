import { 
    Controller, 
    Post, 
    Body, 
    Req, 
    Logger, 
    HttpStatus, 
    HttpException,
    UseMiddleware,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SyncService } from '../../application/tasks/sync/sync.service';
import { WebhookValidatorService } from '../../infrastructure/azure-devops/webhook/webhook-validator.service';
import { WebhookRequest } from '../middleware/webhook-auth.middleware';
import { WebhookPayload } from '../../application/tasks/sync/interfaces/sync.interface';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private readonly syncService: SyncService,
        private readonly webhookValidator: WebhookValidatorService,
    ) {}

    @Post('azure-devops')
    @ApiOperation({
        summary: 'Azure DevOps webhook endpoint',
        description: 'Receives webhook events from Azure DevOps for work item changes',
    })
    @ApiBody({
        description: 'Azure DevOps webhook payload',
        schema: {
            type: 'object',
            properties: {
                eventType: { type: 'string', example: 'workitem.updated' },
                publisherId: { type: 'string', example: 'tfs' },
                resource: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 123 },
                        rev: { type: 'number', example: 2 },
                        fields: { type: 'object' },
                        url: { type: 'string' },
                    },
                },
                resourceContainers: {
                    type: 'object',
                    properties: {
                        project: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                            },
                        },
                    },
                },
                subscriptionId: { type: 'string' },
                createdDate: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                syncResult: {
                    type: 'object',
                    properties: {
                        itemsProcessed: { type: 'number' },
                        itemsCreated: { type: 'number' },
                        itemsUpdated: { type: 'number' },
                        conflicts: { type: 'number' },
                        errors: { type: 'number' },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid webhook payload',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - invalid webhook signature',
    })
    async handleAzureDevOpsWebhook(
        @Body() payload: WebhookPayload,
        @Req() req: WebhookRequest,
    ): Promise<any> {
        const startTime = Date.now();
        
        try {
            this.logger.log(`Received Azure DevOps webhook: ${payload.eventType} for resource ${payload.resource?.id}`);

            // Extract validation metadata from middleware
            const validation = req.webhookValidation;
            if (!validation?.isValid) {
                throw new HttpException('Webhook validation failed', HttpStatus.BAD_REQUEST);
            }

            // Extract tenant ID from request context or payload
            const tenantId = this.extractTenantId(req, payload);
            if (!tenantId) {
                this.logger.warn('Could not determine tenant ID from webhook request');
                return {
                    success: false,
                    message: 'Tenant ID could not be determined',
                };
            }

            // Check if this is a work item event we should process
            if (!this.webhookValidator.isWorkItemEvent(validation.eventType)) {
                this.logger.debug(`Ignoring non-work-item event: ${validation.eventType}`);
                return {
                    success: true,
                    message: 'Event acknowledged but not processed',
                };
            }

            // Process the webhook payload
            const syncResult = await this.syncService.processWebhookPayload(payload, tenantId);
            const processingTime = Date.now() - startTime;

            // Log the webhook event
            this.webhookValidator.logWebhookEvent(
                validation.eventType,
                validation.subscriptionId,
                validation.workItemId,
                syncResult.success,
                syncResult.errors.length > 0 ? syncResult.errors[0]?.error : undefined,
            );

            this.logger.log(`Webhook processed in ${processingTime}ms: ${syncResult.success ? 'success' : 'failed'}`);

            return {
                success: syncResult.success,
                message: syncResult.success 
                    ? 'Webhook processed successfully' 
                    : 'Webhook processing completed with errors',
                syncResult: {
                    itemsProcessed: syncResult.itemsProcessed,
                    itemsCreated: syncResult.itemsCreated,
                    itemsUpdated: syncResult.itemsUpdated,
                    conflicts: syncResult.conflicts.length,
                    errors: syncResult.errors.length,
                    duration: syncResult.duration,
                },
                metadata: {
                    eventType: validation.eventType,
                    workItemId: validation.workItemId,
                    subscriptionId: validation.subscriptionId,
                    processingTime,
                },
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;
            
            this.logger.error(`Webhook processing failed after ${processingTime}ms:`, error);
            
            // Log the failed webhook event
            if (req.webhookValidation) {
                this.webhookValidator.logWebhookEvent(
                    req.webhookValidation.eventType,
                    req.webhookValidation.subscriptionId,
                    req.webhookValidation.workItemId,
                    false,
                    error.message,
                );
            }

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Internal server error processing webhook',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('azure-devops/test')
    @ApiOperation({
        summary: 'Test Azure DevOps webhook endpoint',
        description: 'Endpoint for testing webhook connectivity and validation',
    })
    @ApiResponse({
        status: 200,
        description: 'Test webhook successful',
    })
    async testWebhook(@Body() payload: any, @Req() req: WebhookRequest): Promise<any> {
        this.logger.log('Received test webhook');

        const validation = this.webhookValidator.validateWebhookRequest(
            req.headers,
            payload,
        );

        return {
            success: validation.isValid,
            message: validation.isValid ? 'Test webhook successful' : 'Test webhook failed',
            validation: {
                isValid: validation.isValid,
                errors: validation.errors,
                eventType: validation.eventType,
                subscriptionId: validation.subscriptionId,
            },
            headers: this.extractRelevantHeaders(req.headers),
            timestamp: new Date().toISOString(),
        };
    }

    private extractTenantId(req: WebhookRequest, payload: WebhookPayload): string | null {
        // Try to extract tenant ID from various sources
        
        // 1. From request headers (if set by middleware or proxy)
        const headerTenantId = req.headers['x-tenant-id'] as string;
        if (headerTenantId) {
            return headerTenantId;
        }

        // 2. From query parameters
        const queryTenantId = req.query?.tenantId as string;
        if (queryTenantId) {
            return queryTenantId;
        }

        // 3. From webhook payload custom fields (if configured)
        const payloadTenantId = payload.resource?.fields?.['Custom.TenantId'];
        if (payloadTenantId) {
            return payloadTenantId;
        }

        // 4. From project mapping (would require configuration)
        const projectId = payload.resourceContainers?.project?.id;
        if (projectId) {
            // In a real implementation, you'd have a mapping from project ID to tenant ID
            // For now, we'll try to use the project ID as tenant ID or a default
            const tenantMapping = this.getProjectTenantMapping();
            return tenantMapping[projectId] || projectId;
        }

        // 5. Default tenant if no specific tenant can be determined
        const defaultTenantId = process.env.DEFAULT_TENANT_ID;
        if (defaultTenantId) {
            this.logger.warn('Using default tenant ID for webhook processing');
            return defaultTenantId;
        }

        return null;
    }

    private getProjectTenantMapping(): Record<string, string> {
        // In a real implementation, this would come from configuration or database
        // For now, return empty mapping
        try {
            const mapping = process.env.AZURE_DEVOPS_PROJECT_TENANT_MAPPING;
            if (mapping) {
                return JSON.parse(mapping);
            }
        } catch (error) {
            this.logger.warn('Could not parse project tenant mapping:', error);
        }
        
        return {};
    }

    private extractRelevantHeaders(headers: Record<string, any>): Record<string, any> {
        const relevantHeaders = [
            'content-type',
            'content-length',
            'x-hub-signature',
            'x-hub-signature-256',
            'x-vss-activityid',
            'x-tfs-eventtype',
            'x-vss-subscriptionid',
            'user-agent',
            'x-forwarded-for',
            'x-real-ip',
        ];

        const result: Record<string, any> = {};
        for (const header of relevantHeaders) {
            if (headers[header]) {
                result[header] = headers[header];
            }
        }

        return result;
    }
}