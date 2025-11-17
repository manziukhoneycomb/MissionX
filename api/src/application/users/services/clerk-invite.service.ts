import {
    Injectable,
    InternalServerErrorException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { InviteUserDto, InvitationResponseDto } from '../dto/invite-user.dto';
import { extractErrorInfo } from '../../../domain/utils/error.utils';

@Injectable()
export class ClerkInviteService {
    private readonly logger = new Logger(ClerkInviteService.name);

    async createInvitation(
        inviteDto: InviteUserDto,
        tenantId: string,
        roleNames: string[],
    ): Promise<InvitationResponseDto> {
        try {
            const existingUser = await this.checkExistingUser(inviteDto.email);
            if (existingUser) {
                throw new BadRequestException(
                    'User with this email already exists in the system',
                );
            }

            const invitation = await clerkClient.invitations.createInvitation({
                emailAddress: inviteDto.email,
                publicMetadata: {
                    tenantId: tenantId,
                    roles: roleNames,
                    invitationType: 'tenant-admin',
                },
                redirectUrl: `${process.env.CLERK_INVITATION_REDIRECT_URL || 'http://localhost:3000'}/accept-invitation`,
                notify: true,
            });

            this.logger.log(
                `Successfully created Clerk invitation ${invitation.id} for email: ${inviteDto.email} in tenant: ${tenantId}`,
            );

            return {
                id: invitation.id,
                email: invitation.emailAddress,
                status: invitation.status,
                tenantId: tenantId,
                roles: roleNames,
                createdAt: new Date(invitation.createdAt),
                expiresAt: new Date(invitation.createdAt + 7 * 24 * 60 * 60 * 1000), // 7 days from creation
            };
        } catch (error: unknown) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk invitation creation',
            );
            this.logger.error(
                `Failed to create Clerk invitation for email: ${inviteDto.email}. Error: ${message}`,
                stack,
            );
            throw new InternalServerErrorException(
                'Invitation creation failed during external service interaction.',
            );
        }
    }

    async getInvitation(invitationId: string): Promise<InvitationResponseDto | null> {
        try {
            const invitation = await clerkClient.invitations.getInvitation(invitationId);
            
            if (!invitation) {
                return null;
            }

            const metadata = invitation.publicMetadata as any;

            return {
                id: invitation.id,
                email: invitation.emailAddress,
                status: invitation.status,
                tenantId: metadata?.tenantId || '',
                roles: metadata?.roles || [],
                createdAt: new Date(invitation.createdAt),
                expiresAt: new Date(invitation.createdAt + 7 * 24 * 60 * 60 * 1000),
            };
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk invitation retrieval',
            );
            this.logger.error(
                `Failed to retrieve Clerk invitation ${invitationId}. Error: ${message}`,
                stack,
            );
            return null;
        }
    }

    async revokeInvitation(invitationId: string): Promise<void> {
        try {
            await clerkClient.invitations.revokeInvitation(invitationId);
            this.logger.log(`Successfully revoked Clerk invitation ${invitationId}`);
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk invitation revocation',
            );
            this.logger.error(
                `Failed to revoke Clerk invitation ${invitationId}. Error: ${message}`,
                stack,
            );
            throw new InternalServerErrorException(
                'Invitation revocation failed during external service interaction.',
            );
        }
    }

    async getInvitationsForTenant(tenantId: string): Promise<InvitationResponseDto[]> {
        try {
            const invitations = await clerkClient.invitations.getInvitationList({
                status: ['pending'],
            });

            const tenantInvitations = invitations.data.filter((invitation) => {
                const metadata = invitation.publicMetadata as any;
                return metadata?.tenantId === tenantId;
            });

            return tenantInvitations.map((invitation) => {
                const metadata = invitation.publicMetadata as any;
                return {
                    id: invitation.id,
                    email: invitation.emailAddress,
                    status: invitation.status,
                    tenantId: metadata?.tenantId || '',
                    roles: metadata?.roles || [],
                    createdAt: new Date(invitation.createdAt),
                    expiresAt: new Date(invitation.createdAt + 7 * 24 * 60 * 60 * 1000),
                };
            });
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk invitation list retrieval',
            );
            this.logger.error(
                `Failed to retrieve Clerk invitations for tenant ${tenantId}. Error: ${message}`,
                stack,
            );
            throw new InternalServerErrorException(
                'Invitation retrieval failed during external service interaction.',
            );
        }
    }

    private async checkExistingUser(email: string): Promise<boolean> {
        try {
            const users = await clerkClient.users.getUserList({
                emailAddress: [email],
            });
            return users.data.length > 0;
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during user existence check',
            );
            this.logger.warn(
                `Failed to check existing user for email: ${email}. Error: ${message}`,
                stack,
            );
            return false;
        }
    }

    async getInvitationByEmail(email: string): Promise<InvitationResponseDto | null> {
        try {
            const invitations = await clerkClient.invitations.getInvitationList({
                status: ['pending'],
            });

            const invitation = invitations.data.find(inv => inv.emailAddress === email);
            
            if (!invitation) {
                return null;
            }

            const metadata = invitation.publicMetadata as any;

            return {
                id: invitation.id,
                email: invitation.emailAddress,
                status: invitation.status,
                tenantId: metadata?.tenantId || '',
                roles: metadata?.roles || [],
                createdAt: new Date(invitation.createdAt),
                expiresAt: new Date(invitation.createdAt + 7 * 24 * 60 * 60 * 1000),
            };
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk invitation retrieval by email',
            );
            this.logger.error(
                `Failed to retrieve Clerk invitation for email ${email}. Error: ${message}`,
                stack,
            );
            return null;
        }
    }

    async getAllInvitations(): Promise<InvitationResponseDto[]> {
        try {
            const invitations = await clerkClient.invitations.getInvitationList({
                status: ['pending'],
            });

            return invitations.data.map((invitation) => {
                const metadata = invitation.publicMetadata as any;
                return {
                    id: invitation.id,
                    email: invitation.emailAddress,
                    status: invitation.status,
                    tenantId: metadata?.tenantId || '',
                    roles: metadata?.roles || [],
                    createdAt: new Date(invitation.createdAt),
                    expiresAt: new Date(invitation.createdAt + 7 * 24 * 60 * 60 * 1000),
                };
            });
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk invitation list retrieval',
            );
            this.logger.error(
                `Failed to retrieve all Clerk invitations. Error: ${message}`,
                stack,
            );
            throw new InternalServerErrorException(
                'Invitation retrieval failed during external service interaction.',
            );
        }
    }
}