import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse, AxiosError } from 'axios';
import {
    WebhookDeliveryRequest,
    WebhookDeliveryResponse,
    WebhookRetryConfig,
    WebhookEventPayload,
} from './interfaces/webhook-payload.interface';
import { WebhookSigningService } from './webhook-signing.service';

@Injectable()
export class WebhookDeliveryService {
    private readonly logger = new Logger(WebhookDeliveryService.name);
    
    private readonly DEFAULT_RETRY_CONFIG: WebhookRetryConfig = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 60000,
        backoffFactor: 2,
    };

    constructor(private readonly signingService: WebhookSigningService) {}

    async deliverWebhook(request: WebhookDeliveryRequest): Promise<WebhookDeliveryResponse> {
        const retryConfig = this.buildRetryConfig(request);
        let lastResponse: WebhookDeliveryResponse | null = null;

        for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
            const startTime = Date.now();
            
            try {
                const response = await this.performHttpRequest(request, attempt);
                const duration = Date.now() - startTime;

                const deliveryResponse: WebhookDeliveryResponse = {
                    success: true,
                    statusCode: response.status,
                    response: this.truncateResponse(response.data),
                    duration,
                    attempt,
                };

                this.logger.log(
                    `Webhook delivered successfully to ${request.url} on attempt ${attempt} (${duration}ms)`
                );

                return deliveryResponse;
            } catch (error) {
                const duration = Date.now() - startTime;
                const deliveryResponse = this.handleDeliveryError(error, attempt, duration);
                lastResponse = deliveryResponse;

                this.logger.warn(
                    `Webhook delivery failed to ${request.url} on attempt ${attempt}: ${deliveryResponse.error}`
                );

                if (attempt <= retryConfig.maxRetries && this.isRetryableError(error)) {
                    const delay = this.calculateDelay(attempt, retryConfig);
                    this.logger.log(`Retrying webhook delivery in ${delay}ms (attempt ${attempt + 1})`);
                    await this.sleep(delay);
                    continue;
                }

                break;
            }
        }

        return lastResponse || {
            success: false,
            error: 'Unknown delivery error',
            duration: 0,
            attempt: 1,
        };
    }

    private async performHttpRequest(
        request: WebhookDeliveryRequest,
        attempt: number
    ): Promise<AxiosResponse> {
        const payloadString = JSON.stringify(request.payload);
        const headers = this.buildHeaders(request, payloadString);

        return await axios({
            method: request.method.toLowerCase() as any,
            url: request.url,
            headers,
            data: payloadString,
            timeout: request.timeout || 30000,
            validateStatus: (status) => status < 500, // Don't retry 4xx errors
        });
    }

    private buildHeaders(request: WebhookDeliveryRequest, payloadString: string): Record<string, string> {
        const customHeaders = request.headers || {};
        
        // Extract secret from headers if present (webhook entities should provide this)
        const secret = customHeaders['X-Webhook-Secret'];
        delete customHeaders['X-Webhook-Secret']; // Remove from actual headers

        return this.signingService.createWebhookHeaders(
            payloadString,
            secret,
            {
                'X-Webhook-Id': request.webhookId,
                'X-Webhook-Event-Type': request.payload.eventType,
                ...customHeaders,
            }
        );
    }

    private buildRetryConfig(request: WebhookDeliveryRequest): WebhookRetryConfig {
        // Webhook entities should provide retry policy in headers or a separate field
        const headers = request.headers || {};
        
        return {
            maxRetries: parseInt(headers['X-Max-Retries']) || this.DEFAULT_RETRY_CONFIG.maxRetries,
            baseDelay: parseInt(headers['X-Base-Delay']) || this.DEFAULT_RETRY_CONFIG.baseDelay,
            maxDelay: parseInt(headers['X-Max-Delay']) || this.DEFAULT_RETRY_CONFIG.maxDelay,
            backoffFactor: parseFloat(headers['X-Backoff-Factor']) || this.DEFAULT_RETRY_CONFIG.backoffFactor,
        };
    }

    private handleDeliveryError(error: any, attempt: number, duration: number): WebhookDeliveryResponse {
        let statusCode: number | undefined;
        let errorMessage: string;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            statusCode = axiosError.response?.status;
            errorMessage = axiosError.message;
            
            if (axiosError.response?.data) {
                errorMessage += `: ${this.truncateResponse(axiosError.response.data)}`;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = 'Unknown error occurred';
        }

        return {
            success: false,
            statusCode,
            error: errorMessage,
            duration,
            attempt,
        };
    }

    private isRetryableError(error: any): boolean {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            
            // Retry on network errors (no response)
            if (!axiosError.response) {
                return true;
            }

            // Retry on 5xx server errors and 429 rate limit
            const status = axiosError.response.status;
            return status >= 500 || status === 429;
        }

        // Retry on timeout and network errors
        return error.code === 'ECONNABORTED' || 
               error.code === 'ECONNRESET' || 
               error.code === 'ENOTFOUND' ||
               error.code === 'ETIMEDOUT';
    }

    private calculateDelay(attempt: number, config: WebhookRetryConfig): number {
        const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
        const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter
        return Math.min(jitteredDelay, config.maxDelay);
    }

    private truncateResponse(data: any): string {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        return str.length > 1000 ? str.substring(0, 1000) + '...' : str;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async createEventPayload<T>(
        eventType: string,
        tenantId: string,
        data: T,
        previousData?: T,
        eventId?: string
    ): Promise<WebhookEventPayload<T>> {
        return {
            eventType,
            eventVersion: '1.0',
            tenantId,
            timestamp: new Date().toISOString(),
            eventId: eventId || this.generateEventId(),
            data,
            previousData,
        };
    }

    private generateEventId(): string {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
}