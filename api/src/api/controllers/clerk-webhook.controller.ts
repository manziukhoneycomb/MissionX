import { Controller, Post, Body, Headers, Logger, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ClerkUserSignupService } from '../../infrastructure/services/clerk-user-signup.service';

interface ClerkWebhookEvent {
    type: string;
    data: {
        id: string;
        email_addresses: Array<{
            email_address: string;
            id: string;
        }>;
        first_name?: string;
        last_name?: string;
        public_metadata?: any;
        created_at?: number;
        updated_at?: number;
    };
}

@ApiTags('Webhooks')
@Controller('webhooks/clerk')
export class ClerkWebhookController {
    private readonly logger = new Logger(ClerkWebhookController.name);

    constructor(private readonly clerkUserSignupService: ClerkUserSignupService) {}

    @Post('user-events')
    @HttpCode(HttpStatus.OK)
    @ApiExcludeEndpoint() // Exclude from public API docs since this is for internal webhooks
    @ApiOperation({
        summary: 'Handle Clerk user events',
        description: 'Webhook endpoint to handle user sign-up and other user events from Clerk',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook event processed successfully',
    })
    async handleUserEvents(
        @Body() event: ClerkWebhookEvent,
        @Headers('clerk-signature') signature?: string,
    ): Promise<{ received: boolean }> {
        this.logger.log(`Received Clerk webhook event: ${event.type} for user ${event.data.id}`);

        try {
            // TODO: Add webhook signature verification for security
            // const isValidSignature = this.verifyWebhookSignature(body, signature);
            // if (!isValidSignature) {
            //     throw new UnauthorizedException('Invalid webhook signature');
            // }

            switch (event.type) {
                case 'user.created':
                    await this.handleUserCreated(event);
                    break;
                case 'user.updated':
                    await this.handleUserUpdated(event);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event type: ${event.type}`);
            }

            return { received: true };
        } catch (error) {
            this.logger.error(`Failed to process Clerk webhook event:`, error);
            // Return success to prevent Clerk from retrying, but log the error
            return { received: true };
        }
    }

    private async handleUserCreated(event: ClerkWebhookEvent): Promise<void> {
        const userData = {
            clerkUserId: event.data.id,
            email: event.data.email_addresses[0]?.email_address,
            firstName: event.data.first_name,
            lastName: event.data.last_name,
            publicMetadata: event.data.public_metadata,
        };

        if (!userData.email) {
            this.logger.warn(`User created event missing email for user ${userData.clerkUserId}`);
            return;
        }

        await this.clerkUserSignupService.handleUserSignUp(userData);
    }

    private async handleUserUpdated(event: ClerkWebhookEvent): Promise<void> {
        this.logger.log(`User updated: ${event.data.id}`);
        // Handle user updates if needed
        // For now, just log the event
    }

    // TODO: Implement webhook signature verification
    // private verifyWebhookSignature(body: string, signature?: string): boolean {
    //     if (!signature) {
    //         return false;
    //     }
    //     
    //     const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
    //     if (!webhookSecret) {
    //         this.logger.warn('CLERK_WEBHOOK_SECRET not configured');
    //         return false;
    //     }
    //     
    //     // Implement HMAC verification logic here
    //     return true;
    // }
}