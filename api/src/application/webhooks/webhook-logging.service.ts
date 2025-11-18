import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventPayload, WebhookDeliveryResponse } from './interfaces/webhook-payload.interface';

export interface WebhookLogData {
    webhookId: string;
    event: string;
    payload: WebhookEventPayload;
    url: string;
    method: string;
    status: 'pending' | 'success' | 'failed' | 'retrying';
    attempts: number;
    maxRetries: number;
    lastAttemptAt: Date;
    nextRetryAt?: Date;
    deliveryResponse?: WebhookDeliveryResponse;
    error?: string;
    responseTime: number;
    tenantId: string;
}

@Injectable()
export class WebhookLoggingService {
    private readonly logger = new Logger(WebhookLoggingService.name);

    async logWebhookDeliveryAttempt(logData: WebhookLogData): Promise<void> {
        try {
            // In a real implementation, this would save to the WebhookLog entity
            // For now, we'll use structured logging
            
            this.logger.log({
                message: 'Webhook delivery attempt',
                webhookId: logData.webhookId,
                event: logData.event,
                status: logData.status,
                attempt: logData.attempts,
                maxRetries: logData.maxRetries,
                responseTime: logData.responseTime,
                tenantId: logData.tenantId,
                timestamp: logData.lastAttemptAt.toISOString(),
            });

            // Example of what would be done with a real database:
            // const webhookLog = new WebhookLog();
            // webhookLog.webhookId = logData.webhookId;
            // webhookLog.event = logData.event;
            // webhookLog.payload = JSON.stringify(logData.payload);
            // webhookLog.url = logData.url;
            // webhookLog.method = logData.method;
            // webhookLog.status = logData.status;
            // webhookLog.attempts = logData.attempts;
            // webhookLog.maxRetries = logData.maxRetries;
            // webhookLog.lastAttemptAt = logData.lastAttemptAt;
            // webhookLog.nextRetryAt = logData.nextRetryAt;
            // webhookLog.httpStatus = logData.deliveryResponse?.status;
            // webhookLog.response = logData.deliveryResponse?.response;
            // webhookLog.error = logData.error;
            // webhookLog.responseTime = logData.responseTime;
            // webhookLog.tenantId = logData.tenantId;
            // 
            // await this.webhookLogRepository.save(webhookLog);

        } catch (error) {
            this.logger.error('Failed to log webhook delivery attempt', {
                error: error instanceof Error ? error.message : 'Unknown error',
                webhookId: logData.webhookId,
                event: logData.event,
            });
        }
    }

    async logWebhookDeliverySuccess(
        webhookId: string,
        event: string,
        deliveryResponse: WebhookDeliveryResponse,
        attempts: number,
        tenantId: string,
    ): Promise<void> {
        await this.logWebhookDeliveryAttempt({
            webhookId,
            event,
            payload: {} as WebhookEventPayload, // Not needed for success logging
            url: '',
            method: '',
            status: 'success',
            attempts,
            maxRetries: 0,
            lastAttemptAt: deliveryResponse.timestamp,
            deliveryResponse,
            responseTime: deliveryResponse.responseTime,
            tenantId,
        });

        this.logger.log({
            message: 'Webhook delivered successfully',
            webhookId,
            event,
            attempts,
            responseTime: deliveryResponse.responseTime,
            status: deliveryResponse.status,
            tenantId,
        });
    }

    async logWebhookDeliveryFailure(
        webhookId: string,
        event: string,
        error: string,
        attempts: number,
        maxRetries: number,
        tenantId: string,
        nextRetryAt?: Date,
    ): Promise<void> {
        const status = attempts >= maxRetries ? 'failed' : 'retrying';
        
        await this.logWebhookDeliveryAttempt({
            webhookId,
            event,
            payload: {} as WebhookEventPayload, // Not needed for failure logging
            url: '',
            method: '',
            status,
            attempts,
            maxRetries,
            lastAttemptAt: new Date(),
            nextRetryAt,
            error,
            responseTime: 0,
            tenantId,
        });

        if (status === 'failed') {
            this.logger.error({
                message: 'Webhook delivery failed permanently',
                webhookId,
                event,
                error,
                attempts,
                maxRetries,
                tenantId,
            });
        } else {
            this.logger.warn({
                message: 'Webhook delivery failed, will retry',
                webhookId,
                event,
                error,
                attempts,
                maxRetries,
                nextRetryAt: nextRetryAt?.toISOString(),
                tenantId,
            });
        }
    }

    async getWebhookLogs(
        webhookId?: string,
        tenantId?: string,
        limit: number = 100,
        offset: number = 0,
    ): Promise<any[]> {
        // In a real implementation, this would query the WebhookLog entity
        // For now, return empty array as placeholder
        
        this.logger.debug({
            message: 'Fetching webhook logs',
            webhookId,
            tenantId,
            limit,
            offset,
        });

        // Example query that would be used:
        // const query = this.webhookLogRepository
        //     .createQueryBuilder('log')
        //     .orderBy('log.lastAttemptAt', 'DESC')
        //     .limit(limit)
        //     .offset(offset);
        //
        // if (webhookId) {
        //     query.andWhere('log.webhookId = :webhookId', { webhookId });
        // }
        //
        // if (tenantId) {
        //     query.andWhere('log.tenantId = :tenantId', { tenantId });
        // }
        //
        // return await query.getMany();

        return [];
    }

    async getWebhookStats(tenantId?: string): Promise<any> {
        // In a real implementation, this would aggregate webhook delivery statistics
        this.logger.debug({
            message: 'Fetching webhook statistics',
            tenantId,
        });

        // Example aggregation that would be used:
        // const stats = await this.webhookLogRepository
        //     .createQueryBuilder('log')
        //     .select([
        //         'COUNT(*) as totalDeliveries',
        //         'COUNT(CASE WHEN log.status = \'success\' THEN 1 END) as successful',
        //         'COUNT(CASE WHEN log.status = \'failed\' THEN 1 END) as failed',
        //         'AVG(log.responseTime) as avgResponseTime',
        //     ])
        //     .where(tenantId ? 'log.tenantId = :tenantId' : '1=1', tenantId ? { tenantId } : {})
        //     .getRawOne();

        return {
            totalDeliveries: 0,
            successful: 0,
            failed: 0,
            avgResponseTime: 0,
        };
    }
}