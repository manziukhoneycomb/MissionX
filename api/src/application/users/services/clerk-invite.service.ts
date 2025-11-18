import {
    Injectable,
    Logger,
    InternalServerErrorException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { InviteUserDto, InviteUserResponseDto } from '../dto/invite-user.dto';
import { extractErrorInfo } from '../../../domain/utils/error.utils';

export interface InvitationStatus {
    id: string;
    email: string;
    status: 'pending' | 'accepted' | 'revoked';
    tenantId: string;
    roles: string[];
    createdAt: Date;
}

@Injectable()
export class ClerkInviteService {
    private readonly logger = new Logger(ClerkInviteService.name);

    async inviteUserToTenant(
        inviteDto: InviteUserDto,
        tenantId: string,
        roleNames: string[],
    ): Promise<InviteUserResponseDto> {
        try {
            await this.validateUserDoesNotExist(inviteDto.email);

            const invitation = await clerkClient.invitations.createInvitation({
                emailAddress: inviteDto.email,
                ignoreExisting: false,
                publicMetadata: {
                    tenantId,
                    roles: roleNames,
                    invitedByTenant: true,
                },
                privateMetadata: {
                    tenantId,
                    inviteRoles: roleNames,
                },
            });

            this.logger.log(
                `Successfully created Clerk invitation ${invitation.id} for email ${inviteDto.email} to tenant ${tenantId} with roles: ${roleNames.join(', ')}`,
            );

            const response = new InviteUserResponseDto();
            response.invitationId = invitation.id;
            response.email = invitation.emailAddress;
            response.status = invitation.status;
            response.tenantId = tenantId;
            response.roles = roleNames;

            return response;
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(error, 'Unknown Clerk invitation error');
            this.logger.error(
                `Failed to create invitation for email ${inviteDto.email} to tenant ${tenantId}. Error: ${message}`,
                stack,
            );

            if (message.includes('already exists') || message.includes('duplicate')) {
                throw new BadRequestException('User with this email already exists or has a pending invitation.');
            }

            throw new InternalServerErrorException('Failed to create invitation. Please try again.');
        }
    }

    async getInvitationStatus(invitationId: string): Promise<InvitationStatus | null> {
        try {
            const invitation = await clerkClient.invitations.getInvitation(invitationId);
            
            if (!invitation) {
                return null;
            }

            const tenantId = invitation.publicMetadata?.tenantId as string || '';
            const roles = (invitation.publicMetadata?.roles as string[]) || [];

            return {
                id: invitation.id,
                email: invitation.emailAddress,
                status: invitation.status as 'pending' | 'accepted' | 'revoked',
                tenantId,
                roles,
                createdAt: new Date(invitation.createdAt),
            };
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(error, 'Unknown Clerk invitation query error');
            this.logger.error(
                `Failed to get invitation status for ID ${invitationId}. Error: ${message}`,
                stack,
            );
            return null;
        }
    }

    async revokeInvitation(invitationId: string): Promise<void> {
        try {
            await clerkClient.invitations.revokeInvitation(invitationId);
            this.logger.log(`Successfully revoked invitation ${invitationId}`);
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(error, 'Unknown Clerk revoke invitation error');
            this.logger.error(
                `Failed to revoke invitation ${invitationId}. Error: ${message}`,
                stack,
            );
            throw new InternalServerErrorException('Failed to revoke invitation.');
        }
    }

    async listTenantInvitations(tenantId: string): Promise<InvitationStatus[]> {
        try {
            const invitations = await clerkClient.invitations.getInvitationList({
                status: ['pending'],
            });

            const tenantInvitations = invitations.data
                .filter(invitation => 
                    invitation.publicMetadata?.tenantId === tenantId &&
                    invitation.publicMetadata?.invitedByTenant === true
                )
                .map(invitation => ({
                    id: invitation.id,
                    email: invitation.emailAddress,
                    status: invitation.status as 'pending' | 'accepted' | 'revoked',
                    tenantId: invitation.publicMetadata?.tenantId as string || '',
                    roles: (invitation.publicMetadata?.roles as string[]) || [],
                    createdAt: new Date(invitation.createdAt),
                }));

            return tenantInvitations;
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(error, 'Unknown Clerk list invitations error');
            this.logger.error(
                `Failed to list invitations for tenant ${tenantId}. Error: ${message}`,
                stack,
            );
            return [];
        }
    }

    private async validateUserDoesNotExist(email: string): Promise<void> {
        try {
            const users = await clerkClient.users.getUserList({
                emailAddress: [email],
            });

            if (users.data.length > 0) {
                throw new BadRequestException('User with this email already exists.');
            }

            const pendingInvitations = await clerkClient.invitations.getInvitationList({
                status: ['pending'],
            });

            const existingInvitation = pendingInvitations.data.find(
                invitation => invitation.emailAddress.toLowerCase() === email.toLowerCase()
            );

            if (existingInvitation) {
                throw new BadRequestException('User already has a pending invitation.');
            }
        } catch (error: unknown) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            const { message, stack } = extractErrorInfo(error, 'Unknown Clerk user validation error');
            this.logger.warn(
                `Failed to validate user existence for email ${email}. Proceeding with invitation. Error: ${message}`,
                stack,
            );
        }
    }
}