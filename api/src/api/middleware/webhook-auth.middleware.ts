import { Injectable, NestMiddleware, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WebhookValidatorService } from '../../infrastructure/azure-devops/webhook/webhook-validator.service';

export interface WebhookRequest extends Request {
    rawBody?: Buffer;
    webhookValidation?: {
        eventType: string;
        subscriptionId: string;
        workItemId?: number;
        isValid: boolean;
    };
}

@Injectable()
export class WebhookAuthMiddleware implements NestMiddleware {
    private readonly logger = new Logger(WebhookAuthMiddleware.name);

    constructor(private readonly webhookValidator: WebhookValidatorService) {}

    use(req: WebhookRequest, res: Response, next: NextFunction): void {
        try {
            // Skip webhook validation for non-webhook routes
            if (!req.path.includes('/webhook')) {
                return next();
            }

            this.logger.debug(`Processing webhook request: ${req.method} ${req.path}`);

            // Ensure we have the raw body for signature validation
            if (!req.rawBody && req.body) {
                req.rawBody = Buffer.from(JSON.stringify(req.body), 'utf8');
            }

            // Validate webhook request
            const validationResult = this.webhookValidator.validateWebhookRequest(
                req.headers,
                req.body,
                this.getAllowedIPs(),
            );

            if (!validationResult.isValid) {
                this.logger.warn(`Webhook validation failed: ${validationResult.errors.join(', ')}`);
                throw new UnauthorizedException('Invalid webhook request');
            }

            // Validate webhook signature if secret is configured
            const secret = this.getWebhookSecret();
            if (secret) {
                const signature = req.headers['x-hub-signature-256'] as string || 
                                req.headers['x-hub-signature'] as string;
                const payload = req.rawBody?.toString('utf8') || JSON.stringify(req.body);

                if (!this.webhookValidator.validateWebhookSignature(payload, signature, secret)) {
                    this.logger.warn('Webhook signature validation failed');
                    throw new UnauthorizedException('Invalid webhook signature');
                }
            }

            // Extract work item ID for processing
            const workItemId = this.webhookValidator.extractWorkItemId(req.body);

            // Check if we should process this event
            if (!this.webhookValidator.shouldProcessEvent(req.body, validationResult.eventType!)) {
                this.logger.debug(`Skipping webhook event: ${validationResult.eventType} for work item ${workItemId}`);
                res.status(200).json({ message: 'Event acknowledged but not processed' });
                return;
            }

            // Attach validation metadata to request for use in controller
            req.webhookValidation = {
                eventType: validationResult.eventType!,
                subscriptionId: validationResult.subscriptionId!,
                workItemId,
                isValid: true,
            };

            this.logger.debug(`Webhook validation successful for event: ${validationResult.eventType}`);
            next();

        } catch (error) {
            this.logger.error('Webhook authentication error:', error);

            if (error instanceof UnauthorizedException) {
                res.status(401).json({ 
                    error: 'Unauthorized', 
                    message: error.message 
                });
            } else {
                res.status(400).json({ 
                    error: 'Bad Request', 
                    message: 'Invalid webhook request' 
                });
            }
        }
    }

    private getWebhookSecret(): string | undefined {
        return process.env.AZURE_DEVOPS_WEBHOOK_SECRET;
    }

    private getAllowedIPs(): string[] {
        const allowedIPs = process.env.AZURE_DEVOPS_ALLOWED_IPS;
        if (!allowedIPs) {
            return [];
        }

        return allowedIPs.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
    }
}