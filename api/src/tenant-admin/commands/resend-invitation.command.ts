import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { 
    IUserInvitationRepository, 
    USER_INVITATION_REPOSITORY 
} from '../repositories/user-invitation.repository';
import { UserInvitationDto } from '../dto/user-invitation.dto';
import { UserInvitation } from '../../domain/entities/user-invitation.entity';

@Injectable()
export class ResendInvitationCommand {
    private readonly logger = new Logger(ResendInvitationCommand.name);

    constructor(
        @Inject(USER_INVITATION_REPOSITORY)
        private readonly invitationRepository: IUserInvitationRepository,
    ) {}

    private mapToDto(invitation: UserInvitation): UserInvitationDto {
        const dto = new UserInvitationDto();
        
        dto.id = invitation.id;
        dto.email = invitation.email;
        dto.firstName = invitation.firstName;
        dto.lastName = invitation.lastName;
        dto.status = invitation.status as any;
        dto.tenantId = invitation.tenantId;
        dto.invitedByUserId = invitation.invitedByUserId;
        dto.invitationToken = invitation.invitationToken;
        dto.acceptedByUserId = invitation.acceptedByUserId;
        dto.acceptedAt = invitation.acceptedAt;
        dto.message = invitation.message;
        dto.expiresAt = invitation.expiresAt;
        dto.createdAt = invitation.createdAt;
        dto.updatedAt = invitation.updatedAt;

        return dto;
    }

    async execute(
        invitationId: string,
        requestingUserTenantId: string,
    ): Promise<UserInvitationDto> {
        this.logger.debug(`Resending invitation ${invitationId}`);

        const invitation = await this.invitationRepository.findById(invitationId);

        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
        }

        // Validate tenant access
        if (invitation.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Access denied to invitation from different tenant');
        }

        // Can only resend pending invitations
        if (invitation.status !== 'pending') {
            throw new BadRequestException(`Cannot resend invitation with status: ${invitation.status}`);
        }

        // Check if invitation is expired
        if (invitation.expiresAt < new Date()) {
            // Mark as expired first
            await this.invitationRepository.markAsExpired(invitationId);
            throw new BadRequestException('Invitation has expired and cannot be resent');
        }

        try {
            // In a real implementation, here you would:
            // 1. Generate a new invitation token (optional)
            // 2. Update expiry date
            // 3. Send the email again
            
            // For this implementation, we'll just log that we're resending
            this.logger.log(`Resending invitation ${invitationId} to ${invitation.email}`);
            
            return this.mapToDto(invitation);
        } catch (error: unknown) {
            this.logger.error(`Failed to resend invitation ${invitationId}:`, error);
            throw new InternalServerErrorException('Failed to resend invitation');
        }
    }
}