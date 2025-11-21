import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiHeader,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BillingService } from '../billing.service';
import { WebhookHandlerService } from '../services/webhook-handler.service';
import { extractErrorInfo } from '../../domain/utils/error.utils';

@ApiTags('Webhooks')
@Controller('webhooks/stripe')
export class StripeWebhookController {
    private readonly logger = new Logger(StripeWebhookController.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly webhookHandlerService: WebhookHandlerService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Stripe webhook endpoint',
        description: 'Handles incoming Stripe webhook events for subscription, payment, and customer updates',
    })
    @ApiHeader({
        name: 'stripe-signature',
        description: 'Stripe webhook signature for verification',
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                received: { type: 'boolean', example: true },
                eventId: { type: 'string', example: 'evt_1234567890' },
            },
        },
    })
    @ApiBadRequestResponse({ 
        description: 'Invalid webhook signature or payload',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Invalid webhook signature' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 },
            },
        },
    })
    async handleWebhook(
        @Body() rawBody: string | Buffer,
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: boolean; eventId: string }> {
        this.logger.log('Received Stripe webhook');

        if (!signature) {
            this.logger.error('Missing stripe-signature header');
            throw new BadRequestException('Missing webhook signature');
        }

        try {
            // Construct and verify the webhook event
            const event = this.billingService.constructEvent(rawBody, signature);
            
            this.logger.log(`Processing webhook event: ${event.type} (${event.id})`);

            // Handle the event
            await this.webhookHandlerService.handleWebhookEvent(event);

            this.logger.log(`Successfully processed webhook event: ${event.type} (${event.id})`);
            
            return { 
                received: true, 
                eventId: event.id 
            };
        } catch (error) {
            const { message, stack } = extractErrorInfo(error, 'Unknown webhook error');
            this.logger.error(`Webhook processing failed: ${message}`, stack);
            
            // Re-throw as BadRequestException for invalid signatures
            if (message.includes('signature') || message.includes('timestamp')) {
                throw new BadRequestException('Invalid webhook signature or timestamp');
            }
            
            // For other errors, we still return 200 to prevent Stripe from retrying
            // but log the error for investigation
            this.logger.error('Webhook processing error (returning 200 to prevent retry)', stack);
            return { 
                received: false, 
                eventId: 'unknown' 
            };
        }
    }
}