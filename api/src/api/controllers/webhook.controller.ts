import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { IUserRepository, USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../../application/repositories/role.repository.interface';
import { CreateUserDto } from '../../application/users/dto/create-user.dto';

interface ClerkWebhookEvent {
    type: string;
    data: any;
    object: string;
}

interface InvitationAcceptedEvent {
    type: 'invitation.accepted';
    data: {
        id: string;
        email_address: string;
        public_metadata: {
            tenantId: string;
            roles: string[];
            invitationType: string;
        };
        created_at: number;
        status: string;
    };
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    ) {}

    @Post('clerk')
    @HttpCode(HttpStatus.OK)
    @ApiExcludeEndpoint()
    @ApiOperation({
        summary: 'Clerk webhook handler',
        description: 'Handles Clerk webhooks for invitation acceptance and user creation',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Webhook processed successfully',
    })
    async handleClerkWebhook(
        @Body() payload: ClerkWebhookEvent,
        @Headers('svix-id') svixId: string,
        @Headers('svix-timestamp') svixTimestamp: string,
        @Headers('svix-signature') svixSignature: string,
    ): Promise<{ success: boolean }> {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

        if (!webhookSecret) {
            this.logger.error('Clerk webhook secret not configured');
            throw new BadRequestException('Webhook secret not configured');
        }

        if (!svixId || !svixTimestamp || !svixSignature) {
            this.logger.error('Missing required webhook headers');
            throw new BadRequestException('Missing required webhook headers');
        }

        try {
            if (!this.verifyWebhookSignature(payload, svixSignature, webhookSecret, svixTimestamp)) {
                throw new Error('Invalid webhook signature');
            }

            this.logger.log(`Processing Clerk webhook: ${payload.type}`);

            switch (payload.type) {
                case 'invitation.accepted':
                    await this.handleInvitationAccepted(payload as InvitationAcceptedEvent);
                    break;
                case 'user.created':
                    await this.handleUserCreated(payload);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event type: ${payload.type}`);
            }

            return { success: true };
        } catch (error: unknown) {
            this.logger.error('Webhook verification failed', error);
            throw new BadRequestException('Invalid webhook signature');
        }
    }

    private async handleInvitationAccepted(event: InvitationAcceptedEvent): Promise<void> {
        const { data } = event;
        const { email_address, public_metadata } = data;

        if (!public_metadata || !public_metadata.tenantId || !public_metadata.roles) {
            this.logger.warn(`Invitation accepted but missing metadata: ${email_address}`);
            return;
        }

        const { tenantId, roles } = public_metadata;

        try {
            const existingUser = await this.userRepository.findByEmail(email_address);
            if (existingUser) {
                this.logger.log(
                    `User with email ${email_address} already exists, skipping creation from invitation acceptance`,
                );
                return;
            }

            const roleEntities = await this.roleRepository.findByNames(roles);
            if (roleEntities.length !== roles.length) {
                this.logger.error(
                    `Some roles not found for invitation acceptance: ${email_address}, roles: ${roles.join(', ')}`,
                );
                return;
            }

            const createUserDto: CreateUserDto = {
                email: email_address,
                roleIds: roleEntities.map((r) => r.id),
            };

            const newUser = await this.userRepository.create(createUserDto, tenantId, null);
            this.logger.log(
                `Successfully created user ${newUser.id} from invitation acceptance: ${email_address}`,
            );
        } catch (error: unknown) {
            this.logger.error(
                `Failed to create user from invitation acceptance: ${email_address}`,
                error,
            );
        }
    }

    private async handleUserCreated(event: ClerkWebhookEvent): Promise<void> {
        const { data } = event;
        const { id: clerkUserId, email_addresses, public_metadata } = data;

        if (!public_metadata || !public_metadata.tenantId || !public_metadata.roles) {
            this.logger.log(`User created without invitation metadata, likely direct creation: ${clerkUserId}`);
            return;
        }

        if (!email_addresses || email_addresses.length === 0) {
            this.logger.error(`User created without email addresses: ${clerkUserId}`);
            return;
        }

        const primaryEmail = email_addresses.find((e: any) => e.id === data.primary_email_address_id)?.email_address;
        
        if (!primaryEmail) {
            this.logger.error(`Could not determine primary email for user: ${clerkUserId}`);
            return;
        }

        try {
            const existingUser = await this.userRepository.findBySubId(clerkUserId);
            if (existingUser) {
                this.logger.log(`User with Clerk ID ${clerkUserId} already exists locally`);
                return;
            }

            const existingUserByEmail = await this.userRepository.findByEmail(primaryEmail);
            if (existingUserByEmail && !existingUserByEmail.subId) {
                await this.userRepository.setSubId(existingUserByEmail.id, clerkUserId);
                this.logger.log(
                    `Updated existing user ${existingUserByEmail.id} with Clerk ID ${clerkUserId}`,
                );
            } else if (!existingUserByEmail) {
                this.logger.log(
                    `User created in Clerk but not found locally, may be handled by invitation flow: ${primaryEmail}`,
                );
            }
        } catch (error: unknown) {
            this.logger.error(`Failed to handle user created event for ${clerkUserId}`, error);
        }
    }

    private verifyWebhookSignature(
        payload: ClerkWebhookEvent,
        signature: string,
        secret: string,
        timestamp: string,
    ): boolean {
        try {
            const payloadString = JSON.stringify(payload);
            const signedPayload = `${timestamp}.${payloadString}`;
            
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(signedPayload)
                .digest('base64');

            const signatures = signature.split(',');
            const v1Signature = signatures.find((sig) => sig.startsWith('v1='));
            
            if (!v1Signature) {
                return false;
            }

            const receivedSignature = v1Signature.split('=')[1];
            return crypto.timingSafeEqual(
                Buffer.from(expectedSignature),
                Buffer.from(receivedSignature),
            );
        } catch (error) {
            this.logger.error('Error verifying webhook signature', error);
            return false;
        }
    }
}