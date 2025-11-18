import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { InviteUserDto, InviteResponseDto } from '../../application/users/dto/invite-user.dto';

export interface ClerkInvitationMetadata {
    tenantId: string;
    roleIds: string[];
    invitedBy: string;
    customMessage?: string;
}

@Injectable()
export class ClerkInviteService {
    private readonly logger = new Logger(ClerkInviteService.name);
    private readonly clerkClient;

    constructor(private configService: ConfigService) {
        const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
        if (!secretKey) {
            this.logger.warn('CLERK_SECRET_KEY not found in environment variables');
        }
        this.clerkClient = createClerkClient({ secretKey });
    }

    async inviteUser(
        inviteDto: InviteUserDto,
        tenantId: string,
        invitedByUserId: string,
    ): Promise<InviteResponseDto> {
        try {
            this.logger.log(`Inviting user ${inviteDto.email} to tenant ${tenantId}`);

            // Prepare metadata to store with the invitation
            const metadata: ClerkInvitationMetadata = {
                tenantId,
                roleIds: inviteDto.roleIds,
                invitedBy: invitedByUserId,
                customMessage: inviteDto.message,
            };

            // Create invitation via Clerk
            const invitation = await this.clerkClient.invitations.createInvitation({
                emailAddress: inviteDto.email,
                publicMetadata: {
                    tenantId,
                    roleIds: inviteDto.roleIds,
                },
                privateMetadata: metadata,
                redirectUrl: `${this.configService.get<string>('CLIENT_URL')}/accept-invitation`,
                notify: true, // Send email notification
            });

            this.logger.log(`Successfully created invitation ${invitation.id} for ${inviteDto.email}`);

            return {
                invitationId: invitation.id,
                email: invitation.emailAddress,
                status: invitation.status,
                tenantId,
                roleIds: inviteDto.roleIds,
                createdAt: new Date(invitation.createdAt),
                expiresAt: new Date(invitation.createdAt + 7 * 24 * 60 * 60 * 1000), // 7 days from creation
            };
        } catch (error) {
            this.logger.error(`Failed to invite user ${inviteDto.email}:`, error);
            throw new Error(`Failed to create invitation: ${error.message}`);
        }
    }

    async getInvitation(invitationId: string): Promise<any> {
        try {
            const invitation = await this.clerkClient.invitations.getInvitation({
                invitationId,
            });
            return invitation;
        } catch (error) {
            this.logger.error(`Failed to retrieve invitation ${invitationId}:`, error);
            throw new Error(`Failed to retrieve invitation: ${error.message}`);
        }
    }

    async revokeInvitation(invitationId: string): Promise<void> {
        try {
            await this.clerkClient.invitations.revokeInvitation({
                invitationId,
            });
            this.logger.log(`Successfully revoked invitation ${invitationId}`);
        } catch (error) {
            this.logger.error(`Failed to revoke invitation ${invitationId}:`, error);
            throw new Error(`Failed to revoke invitation: ${error.message}`);
        }
    }

    async listInvitationsByTenant(tenantId: string): Promise<InviteResponseDto[]> {
        try {
            // Note: Clerk doesn't have a direct filter by metadata, so we need to fetch all
            // and filter client-side. In production, consider implementing server-side tracking.
            const invitations = await this.clerkClient.invitations.getInvitationList({
                status: ['pending'],
            });

            const tenantInvitations = invitations.data.filter((invitation) =>
                invitation.publicMetadata?.tenantId === tenantId
            );

            return tenantInvitations.map((invitation) => ({
                invitationId: invitation.id,
                email: invitation.emailAddress,
                status: invitation.status,
                tenantId,
                roleIds: (invitation.publicMetadata?.roleIds as string[]) || [],
                createdAt: new Date(invitation.createdAt),
                expiresAt: new Date(invitation.createdAt + 7 * 24 * 60 * 60 * 1000),
            }));
        } catch (error) {
            this.logger.error(`Failed to list invitations for tenant ${tenantId}:`, error);
            throw new Error(`Failed to list invitations: ${error.message}`);
        }
    }

    async handleInvitationAcceptance(userId: string): Promise<{
        tenantId?: string;
        roleIds?: string[];
        processed: boolean;
    }> {
        try {
            // Get user details from Clerk
            const user = await this.clerkClient.users.getUser(userId);
            
            // Check if user has invitation metadata
            const publicMetadata = user.publicMetadata as any;
            const privateMetadata = user.privateMetadata as ClerkInvitationMetadata;
            
            if (publicMetadata?.tenantId && publicMetadata?.roleIds) {
                this.logger.log(`Processing invitation acceptance for user ${userId}, tenant ${publicMetadata.tenantId}`);
                
                // Mark invitation as accepted in user metadata
                await this.clerkClient.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        ...publicMetadata,
                        invitationAccepted: true,
                        acceptedAt: new Date().toISOString(),
                    },
                });

                return {
                    tenantId: publicMetadata.tenantId,
                    roleIds: publicMetadata.roleIds,
                    processed: true,
                };
            }

            return { processed: false };
        } catch (error) {
            this.logger.error(`Failed to handle invitation acceptance for user ${userId}:`, error);
            throw new Error(`Failed to process invitation acceptance: ${error.message}`);
        }
    }
}