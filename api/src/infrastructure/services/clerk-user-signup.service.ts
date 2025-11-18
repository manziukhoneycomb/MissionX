import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { ClerkInviteService } from './clerk-invite.service';

export interface SignUpUserData {
    clerkUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    publicMetadata?: any;
}

@Injectable()
export class ClerkUserSignupService {
    private readonly logger = new Logger(ClerkUserSignupService.name);
    private readonly clerkClient;

    constructor(
        private configService: ConfigService,
        private clerkInviteService: ClerkInviteService,
    ) {
        const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
        if (!secretKey) {
            this.logger.warn('CLERK_SECRET_KEY not found in environment variables');
        }
        this.clerkClient = createClerkClient({ secretKey });
    }

    async handleUserSignUp(userData: SignUpUserData): Promise<void> {
        try {
            this.logger.log(`Processing user sign-up for Clerk user ${userData.clerkUserId}`);

            // Get user details from Clerk
            const clerkUser = await this.clerkClient.users.getUser(userData.clerkUserId);
            
            // Check if user has invitation metadata
            const publicMetadata = clerkUser.publicMetadata as any;
            if (publicMetadata?.tenantId && publicMetadata?.roleIds) {
                this.logger.log(`User ${userData.clerkUserId} signed up via invitation to tenant ${publicMetadata.tenantId}`);
                
                // Handle invitation acceptance
                await this.clerkInviteService.handleInvitationAcceptance(userData.clerkUserId);
                
                this.logger.log(`Successfully processed invitation acceptance for user ${userData.clerkUserId}`);
            } else {
                this.logger.log(`User ${userData.clerkUserId} signed up without invitation metadata`);
            }
        } catch (error) {
            this.logger.error(`Failed to handle user sign-up for ${userData.clerkUserId}:`, error);
            // Don't throw error to avoid blocking user registration
            // Just log for now - the user creation flow will handle the actual user creation
        }
    }

    async syncInvitationDataToUser(clerkUserId: string, tenantId: string, roleIds: string[]): Promise<void> {
        try {
            // Update user's public metadata with tenant and role information
            await this.clerkClient.users.updateUserMetadata(clerkUserId, {
                publicMetadata: {
                    tenantId,
                    roleIds,
                    invitationProcessed: true,
                    processedAt: new Date().toISOString(),
                },
            });

            this.logger.log(`Updated metadata for user ${clerkUserId} with tenant ${tenantId} and roles ${roleIds.join(', ')}`);
        } catch (error) {
            this.logger.error(`Failed to sync invitation data to user ${clerkUserId}:`, error);
            throw new Error(`Failed to sync invitation data: ${error.message}`);
        }
    }
}