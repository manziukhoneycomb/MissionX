import { Injectable, Logger, Inject } from '@nestjs/common';
import { WebhookDeliveryService } from './webhook-delivery.service';
import {
    WebhookEventContext,
    WebhookDeliveryRequest,
    WebhookDeliveryResponse,
    WEBHOOK_EVENT_TYPES,
} from './interfaces/webhook-payload.interface';
import { Webhook } from '../../domain/entities/webhook.entity';
import { WebhookLog } from '../../domain/entities/webhook-log.entity';
import { IWebhookRepository, IWebhookLogRepository, WEBHOOK_REPOSITORY, WEBHOOK_LOG_REPOSITORY } from '../repositories/webhook.repository';

@Injectable()
export class WebhookEventService {
    private readonly logger = new Logger(WebhookEventService.name);

    constructor(
        private readonly deliveryService: WebhookDeliveryService,
        @Inject(WEBHOOK_REPOSITORY)
        private readonly webhookRepository: IWebhookRepository,
        @Inject(WEBHOOK_LOG_REPOSITORY)
        private readonly webhookLogRepository: IWebhookLogRepository,
    ) {}

    async processEntityEvent<T>(
        context: WebhookEventContext,
        entityData: T,
        previousEntityData?: T,
    ): Promise<void> {
        const eventType = this.buildEventType(context);
        
        this.logger.log(
            `Processing webhook event: ${eventType} for ${context.entityType} ${context.entityId} in tenant ${context.tenantId}`
        );

        // This would normally get webhooks from the database/repository
        // For now, creating a placeholder that other subtasks can implement
        const webhooks = await this.getActiveWebhooksForEvent(context.tenantId, eventType);

        if (webhooks.length === 0) {
            this.logger.debug(`No active webhooks found for event: ${eventType}`);
            return;
        }

        const payload = await this.deliveryService.createEventPayload(
            eventType,
            context.tenantId,
            entityData,
            previousEntityData
        );

        // Process webhooks in parallel for better performance
        const deliveryPromises = webhooks.map(webhook => 
            this.deliverToWebhook(webhook, payload, context)
        );

        const results = await Promise.allSettled(deliveryPromises);
        
        // Log overall results
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - successful;
        
        this.logger.log(
            `Webhook delivery completed for ${eventType}: ${successful} successful, ${failed} failed`
        );
    }

    private async deliverToWebhook(
        webhook: Webhook,
        payload: any,
        context: WebhookEventContext
    ): Promise<void> {
        const request: WebhookDeliveryRequest = {
            webhookId: webhook.id,
            url: webhook.url,
            method: webhook.method,
            headers: this.buildWebhookHeaders(webhook),
            payload,
            timeout: webhook.timeout || 30000,
        };

        const startTime = Date.now();
        
        try {
            const response = await this.deliveryService.deliverWebhook(request);
            await this.logWebhookDelivery(webhook, context, response);
            
            if (!response.success) {
                this.logger.error(
                    `Webhook delivery failed for ${webhook.url}: ${response.error}`
                );
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorResponse: WebhookDeliveryResponse = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration,
                attempt: 1,
            };

            await this.logWebhookDelivery(webhook, context, errorResponse);
            this.logger.error(
                `Webhook delivery error for ${webhook.url}: ${error}`
            );
        }
    }

    private buildWebhookHeaders(webhook: Webhook): Record<string, string> {
        const headers: Record<string, string> = {
            ...webhook.headers,
        };

        // Include secret in headers for signing service
        if (webhook.secret) {
            headers['X-Webhook-Secret'] = webhook.secret;
        }

        // Include retry policy in headers
        headers['X-Max-Retries'] = webhook.maxRetries.toString();
        if (webhook.retryPolicy) {
            headers['X-Base-Delay'] = webhook.retryPolicy.retryInterval.toString();
            if (webhook.retryPolicy.backoffMultiplier) {
                headers['X-Backoff-Factor'] = webhook.retryPolicy.backoffMultiplier.toString();
            }
        }

        return headers;
    }

    private buildEventType(context: WebhookEventContext): string {
        const entityType = context.entityType.toUpperCase();
        const action = context.action.toUpperCase();

        // Map to defined event types
        if (entityType === 'USER' && WEBHOOK_EVENT_TYPES.USER[action as keyof typeof WEBHOOK_EVENT_TYPES.USER]) {
            return WEBHOOK_EVENT_TYPES.USER[action as keyof typeof WEBHOOK_EVENT_TYPES.USER];
        }

        if (entityType === 'INVOICE' && WEBHOOK_EVENT_TYPES.INVOICE[action as keyof typeof WEBHOOK_EVENT_TYPES.INVOICE]) {
            return WEBHOOK_EVENT_TYPES.INVOICE[action as keyof typeof WEBHOOK_EVENT_TYPES.INVOICE];
        }

        if (entityType === 'TENANT' && WEBHOOK_EVENT_TYPES.TENANT[action as keyof typeof WEBHOOK_EVENT_TYPES.TENANT]) {
            return WEBHOOK_EVENT_TYPES.TENANT[action as keyof typeof WEBHOOK_EVENT_TYPES.TENANT];
        }

        // Fallback to generic format
        return `${context.entityType.toLowerCase()}.${context.action}`;
    }

    private async getActiveWebhooksForEvent(tenantId: string, eventType: string): Promise<Webhook[]> {
        try {
            // Use findActiveByTenant and filter by events manually since there's no findByEvents method
            const activeWebhooks = await this.webhookRepository.findActiveByTenant(tenantId);
            return activeWebhooks.filter(webhook => 
                webhook.events.includes(eventType)
            );
        } catch (error) {
            this.logger.error(`Failed to fetch active webhooks for event ${eventType}: ${error}`);
            return [];
        }
    }

    private async logWebhookDelivery(
        webhook: Webhook,
        context: WebhookEventContext,
        response: WebhookDeliveryResponse
    ): Promise<void> {
        try {
            const eventType = this.buildEventType(context);
            const payload = {
                success: response.success,
                statusCode: response.statusCode,
                response: response.response,
                error: response.error,
                duration: response.duration,
                attempt: response.attempt,
            };

            await this.webhookLogRepository.create(
                webhook.id,
                eventType,
                payload,
                webhook.tenantId
            );

            this.logger.debug(
                `Webhook log created for webhook ${webhook.id}: ${response.success ? 'SUCCESS' : 'FAILED'}`
            );
        } catch (error) {
            this.logger.error(
                `Failed to log webhook delivery for webhook ${webhook.id}: ${error}`
            );
        }
    }

    // Helper methods for triggering events from other services
    async triggerUserEvent(
        action: 'created' | 'updated' | 'deleted',
        userData: any,
        tenantId: string,
        userId: string,
        previousData?: any
    ): Promise<void> {
        const context: WebhookEventContext = {
            entityType: 'user',
            entityId: userId,
            action,
            tenantId,
            userId,
            timestamp: new Date(),
        };

        await this.processEntityEvent(context, userData, previousData);
    }

    async triggerInvoiceEvent(
        action: 'created' | 'updated' | 'deleted',
        invoiceData: any,
        tenantId: string,
        invoiceId: string,
        userId?: string,
        previousData?: any
    ): Promise<void> {
        const context: WebhookEventContext = {
            entityType: 'invoice',
            entityId: invoiceId,
            action,
            tenantId,
            userId,
            timestamp: new Date(),
        };

        await this.processEntityEvent(context, invoiceData, previousData);
    }

    async triggerTenantEvent(
        action: 'created' | 'updated' | 'deleted',
        tenantData: any,
        tenantId: string,
        userId?: string,
        previousData?: any
    ): Promise<void> {
        const context: WebhookEventContext = {
            entityType: 'tenant',
            entityId: tenantId,
            action,
            tenantId,
            userId,
            timestamp: new Date(),
        };

        await this.processEntityEvent(context, tenantData, previousData);
    }
}