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

@Injectable()
export class CancelInvitationCommand {
    private readonly logger = new Logger(CancelInvitationCommand.name);

    constructor(
        @Inject(USER_INVITATION_REPOSITORY)
        private readonly invitationRepository: IUserInvitationRepository,
    ) {}

    async execute(
        invitationId: string,
        requestingUserTenantId: string,
    ): Promise<void> {
        this.logger.debug(`Cancelling invitation ${invitationId}`);

        const invitation = await this.invitationRepository.findById(invitationId);

        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
        }

        // Validate tenant access
        if (invitation.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Access denied to invitation from different tenant');
        }

        // Can only cancel pending invitations
        if (invitation.status !== 'pending') {
            throw new BadRequestException(`Cannot cancel invitation with status: ${invitation.status}`);
        }

        try {
            await this.invitationRepository.markAsRevoked(invitationId);
            
            this.logger.log(`Successfully cancelled invitation ${invitationId} for ${invitation.email}`);
        } catch (error: unknown) {
            this.logger.error(`Failed to cancel invitation ${invitationId}:`, error);
            throw new InternalServerErrorException('Failed to cancel invitation');
        }
    }
}