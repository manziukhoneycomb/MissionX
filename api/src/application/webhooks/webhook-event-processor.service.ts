import { Injectable, Logger } from '@nestjs/common';
import { WebhookDeliveryService, WebhookConfig } from './webhook-delivery.service';
import { WebhookLoggingService } from './webhook-logging.service';
import { WebhookEventPayload, WEBHOOK_EVENT_TYPES, WebhookEventType } from './interfaces/webhook-payload.interface';

export interface WebhookLogEntry {
    id?: string;
    webhookId: string;
    event: string;
    payload: WebhookEventPayload;
    status: 'pending' | 'success' | 'failed';
    attempts: number;
    lastAttemptAt: Date;
    nextRetryAt?: Date;
    response?: string;
    error?: string;
    responseTime: number;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class WebhookEventProcessorService {
    private readonly logger = new Logger(WebhookEventProcessorService.name);
    private readonly webhookLogs: WebhookLogEntry[] = []; // In-memory storage for logging

    constructor(
        private readonly deliveryService: WebhookDeliveryService,
        private readonly loggingService: WebhookLoggingService,
    ) {}

    async processEvent(
        eventType: WebhookEventType,
        entityData: Record<string, any>,
        tenantId: string,
        entityId: string,
        entityType: string,
    ): Promise<void> {
        const payload: WebhookEventPayload = {
            event: eventType,
            timestamp: new Date(),
            data: entityData,
            metadata: {
                tenantId,
                entityId,
                entityType,
                version: '1.0',
            },
        };

        // Get webhooks subscribed to this event for the tenant
        const subscribedWebhooks = await this.getSubscribedWebhooks(eventType, tenantId);

        if (subscribedWebhooks.length === 0) {
            this.logger.debug(`No webhooks subscribed to event ${eventType} for tenant ${tenantId}`);
            return;
        }

        this.logger.log(`Processing ${subscribedWebhooks.length} webhooks for event ${eventType}`);

        // Process each webhook
        const deliveryPromises = subscribedWebhooks.map(webhook => 
            this.processWebhookDelivery(webhook, payload)
        );

        await Promise.allSettled(deliveryPromises);
    }

    private async processWebhookDelivery(webhook: WebhookConfig, payload: WebhookEventPayload): Promise<void> {
        const logEntry: WebhookLogEntry = {
            webhookId: webhook.id,
            event: payload.event,
            payload,
            status: 'pending',
            attempts: 0,
            lastAttemptAt: new Date(),
            responseTime: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            this.logWebhookAttempt(logEntry);

            const deliveryResponse = await this.deliveryService.deliverWebhook(webhook, payload);

            logEntry.status = deliveryResponse.success ? 'success' : 'failed';
            logEntry.attempts = 1; // The delivery service handles retries internally
            logEntry.lastAttemptAt = deliveryResponse.timestamp;
            logEntry.response = deliveryResponse.response;
            logEntry.error = deliveryResponse.error;
            logEntry.responseTime = deliveryResponse.responseTime;
            logEntry.updatedAt = new Date();

            this.updateWebhookLog(logEntry);

            // Use the logging service for structured logging
            if (deliveryResponse.success) {
                await this.loggingService.logWebhookDeliverySuccess(
                    webhook.id,
                    payload.event,
                    deliveryResponse,
                    1,
                    webhook.tenantId,
                );
            } else {
                await this.loggingService.logWebhookDeliveryFailure(
                    webhook.id,
                    payload.event,
                    deliveryResponse.error || 'Unknown error',
                    1,
                    webhook.maxRetries || 3,
                    webhook.tenantId,
                );
            }
        } catch (error) {
            logEntry.status = 'failed';
            logEntry.error = error instanceof Error ? error.message : 'Unknown error';
            logEntry.updatedAt = new Date();
            
            this.updateWebhookLog(logEntry);
            
            await this.loggingService.logWebhookDeliveryFailure(
                webhook.id,
                payload.event,
                error instanceof Error ? error.message : 'Unknown error',
                1,
                webhook.maxRetries || 3,
                webhook.tenantId,
            );
        }
    }

    private async getSubscribedWebhooks(eventType: WebhookEventType, tenantId: string): Promise<WebhookConfig[]> {
        // In a real implementation, this would query the database for webhooks
        // For now, return empty array since webhook entities should be implemented by other subtasks
        // This method should integrate with the webhook service/repository when available
        
        // Example structure that would be used:
        // return await this.webhookRepository.findByEventAndTenant(eventType, tenantId);
        
        return [];
    }

    private logWebhookAttempt(logEntry: WebhookLogEntry): void {
        // Add to in-memory log store
        logEntry.id = this.generateId();
        this.webhookLogs.push(logEntry);
        
        this.logger.debug(`Logging webhook attempt for webhook ${logEntry.webhookId}, event ${logEntry.event}`);
    }

    private updateWebhookLog(logEntry: WebhookLogEntry): void {
        const existingIndex = this.webhookLogs.findIndex(log => log.id === logEntry.id);
        if (existingIndex >= 0) {
            this.webhookLogs[existingIndex] = logEntry;
        }
        
        this.logger.debug(
            `Updated webhook log for webhook ${logEntry.webhookId}: ${logEntry.status} (${logEntry.responseTime}ms)`,
        );
    }

    async getWebhookLogs(webhookId?: string, limit: number = 100): Promise<WebhookLogEntry[]> {
        let logs = this.webhookLogs;
        
        if (webhookId) {
            logs = logs.filter(log => log.webhookId === webhookId);
        }
        
        return logs
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Event trigger methods for different entity types
    async triggerUserEvent(eventType: 'created' | 'updated' | 'deleted', userData: any, tenantId: string): Promise<void> {
        const webhookEventType = `user.${eventType}` as WebhookEventType;
        await this.processEvent(webhookEventType, userData, tenantId, userData.id, 'user');
    }

    async triggerInvoiceEvent(eventType: 'created' | 'updated' | 'deleted' | 'paid' | 'cancelled', invoiceData: any, tenantId: string): Promise<void> {
        const webhookEventType = `invoice.${eventType}` as WebhookEventType;
        await this.processEvent(webhookEventType, invoiceData, tenantId, invoiceData.id, 'invoice');
    }

    async triggerTenantEvent(eventType: 'created' | 'updated' | 'deleted', tenantData: any, tenantId: string): Promise<void> {
        const webhookEventType = `tenant.${eventType}` as WebhookEventType;
        await this.processEvent(webhookEventType, tenantData, tenantId, tenantData.id, 'tenant');
    }
}