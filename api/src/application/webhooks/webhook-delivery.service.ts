import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { WebhookSigningService } from './webhook-signing.service';
import {
    WebhookEventPayload,
    WebhookDeliveryResponse,
    WebhookRetryPolicy,
    WebhookDeliveryRequest,
    WebhookDeliveryAttempt,
    WebhookHeaders,
} from './interfaces/webhook-payload.interface';

export interface WebhookConfig {
    id: string;
    url: string;
    method: string;
    events: string[];
    isActive: boolean;
    secret?: string;
    headers?: WebhookHeaders;
    retryPolicy?: WebhookRetryPolicy;
    timeout: number;
    maxRetries: number;
    tenantId: string;
}

@Injectable()
export class WebhookDeliveryService {
    private readonly logger = new Logger(WebhookDeliveryService.name);

    constructor(private readonly signingService: WebhookSigningService) {}

    async deliverWebhook(
        webhook: WebhookConfig,
        payload: WebhookEventPayload,
    ): Promise<WebhookDeliveryResponse> {
        if (!webhook.isActive) {
            this.logger.warn(`Webhook ${webhook.id} is inactive, skipping delivery`);
            return {
                success: false,
                status: 0,
                error: 'Webhook is inactive',
                responseTime: 0,
                timestamp: new Date(),
            };
        }

        if (!webhook.events.includes(payload.event)) {
            this.logger.debug(`Webhook ${webhook.id} not subscribed to event ${payload.event}`);
            return {
                success: false,
                status: 0,
                error: 'Webhook not subscribed to event',
                responseTime: 0,
                timestamp: new Date(),
            };
        }

        const retryPolicy: WebhookRetryPolicy = webhook.retryPolicy || {
            maxRetries: webhook.maxRetries || 3,
            initialDelayMs: 1000,
            maxDelayMs: 60000,
            backoffMultiplier: 2,
        };

        const attempts: WebhookDeliveryAttempt[] = [];
        let lastResponse: WebhookDeliveryResponse;

        for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
            if (attempt > 0) {
                const delay = this.calculateDelay(attempt, retryPolicy);
                this.logger.debug(`Retrying webhook ${webhook.id} in ${delay}ms (attempt ${attempt + 1})`);
                await this.sleep(delay);
            }

            const startTime = Date.now();
            const attemptResponse = await this.sendWebhookRequest(webhook, payload, attempt + 1);
            const endTime = Date.now();

            const attemptRecord: WebhookDeliveryAttempt = {
                attemptNumber: attempt + 1,
                timestamp: new Date(),
                status: attemptResponse.status,
                response: attemptResponse.response,
                error: attemptResponse.error,
                responseTime: endTime - startTime,
            };

            attempts.push(attemptRecord);
            lastResponse = attemptResponse;

            if (attemptResponse.success) {
                this.logger.log(`Webhook ${webhook.id} delivered successfully on attempt ${attempt + 1}`);
                break;
            }

            if (!this.shouldRetry(attemptResponse.status)) {
                this.logger.warn(
                    `Webhook ${webhook.id} failed with non-retryable status ${attemptResponse.status}`,
                );
                break;
            }

            if (attempt === retryPolicy.maxRetries) {
                this.logger.error(`Webhook ${webhook.id} failed after ${retryPolicy.maxRetries + 1} attempts`);
            }
        }

        return lastResponse!;
    }

    private async sendWebhookRequest(
        webhook: WebhookConfig,
        payload: WebhookEventPayload,
        attemptNumber: number,
    ): Promise<WebhookDeliveryResponse> {
        try {
            const headers: WebhookHeaders = {
                'Content-Type': 'application/json',
                'User-Agent': 'MissionX-Webhooks/1.0',
                'X-Webhook-Attempt': attemptNumber.toString(),
                'X-Webhook-Event': payload.event,
                'X-Webhook-Timestamp': payload.timestamp.toISOString(),
                ...webhook.headers,
            };

            if (webhook.secret) {
                headers['X-Webhook-Signature'] = this.signingService.generateSignature(payload, webhook.secret);
            }

            const request: WebhookDeliveryRequest = {
                url: webhook.url,
                method: webhook.method,
                headers,
                payload,
                timeout: webhook.timeout,
            };

            if (webhook.secret) {
                request.signature = headers['X-Webhook-Signature'];
            }

            const startTime = Date.now();
            const response: AxiosResponse = await axios({
                method: request.method as any,
                url: request.url,
                headers: request.headers,
                data: request.payload,
                timeout: request.timeout,
                validateStatus: () => true, // Don't throw on non-2xx status codes
            });
            const responseTime = Date.now() - startTime;

            const success = response.status >= 200 && response.status < 300;
            
            return {
                success,
                status: response.status,
                response: this.truncateResponse(JSON.stringify(response.data)),
                responseTime,
                timestamp: new Date(),
            };
        } catch (error) {
            const responseTime = 0;
            let errorMessage = 'Unknown error';
            let status = 0;

            if (error instanceof AxiosError) {
                errorMessage = error.message;
                status = error.response?.status || 0;
                
                if (error.code === 'ECONNREFUSED') {
                    errorMessage = 'Connection refused';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage = 'Request timeout';
                } else if (error.code === 'ENOTFOUND') {
                    errorMessage = 'Host not found';
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            this.logger.error(`Webhook delivery failed for ${webhook.id}: ${errorMessage}`, error);

            return {
                success: false,
                status,
                error: errorMessage,
                responseTime,
                timestamp: new Date(),
            };
        }
    }

    private calculateDelay(attempt: number, retryPolicy: WebhookRetryPolicy): number {
        const delay = retryPolicy.initialDelayMs * Math.pow(retryPolicy.backoffMultiplier, attempt - 1);
        return Math.min(delay, retryPolicy.maxDelayMs);
    }

    private shouldRetry(statusCode: number): boolean {
        // Retry on 5xx server errors and some specific 4xx errors
        if (statusCode >= 500) return true;
        if (statusCode === 408) return true; // Request Timeout
        if (statusCode === 429) return true; // Too Many Requests
        if (statusCode === 0) return true; // Network/connection error
        
        return false;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private truncateResponse(response: string, maxLength: number = 1000): string {
        if (response.length <= maxLength) return response;
        return response.substring(0, maxLength) + '... [truncated]';
    }
}