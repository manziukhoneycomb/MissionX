import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { IInvitationRepository, INVITATION_REPOSITORY } from '../repositories/invitation.repository.interface';
import { IInvitationQueries } from './interfaces/invitation-queries.interface';
import { InvitationDto } from './dto/invite-user.dto';
import { Invitation } from '../../domain/entities/invitation.entity';

@Injectable()
export class InvitationQueries implements IInvitationQueries {
    constructor(
        @Inject(INVITATION_REPOSITORY)
        private readonly invitationRepository: IInvitationRepository,
    ) {}

    private mapToDto(invitation: Invitation): InvitationDto {
        const dto = new InvitationDto();
        dto.id = invitation.id;
        dto.email = invitation.email;
        dto.firstName = invitation.firstName;
        dto.lastName = invitation.lastName;
        dto.status = invitation.status;
        dto.createdAt = invitation.createdAt.toISOString();
        dto.expiresAt = invitation.expiresAt.toISOString();
        dto.invitedBy = invitation.invitedBy;

        if (invitation.tenant) {
            dto.tenant = { id: invitation.tenant.id, name: invitation.tenant.name };
        }

        if (invitation.roles) {
            dto.roles = invitation.roles.map((role) => ({
                id: role.id,
                name: role.name,
            }));
        }

        return dto;
    }

    async findInvitationsByTenant(tenantId: string): Promise<InvitationDto[]> {
        const invitations = await this.invitationRepository.findAllByTenantId(tenantId);
        return invitations.map((invitation) => this.mapToDto(invitation));
    }

    async findInvitationById(id: string, tenantId?: string): Promise<InvitationDto> {
        const invitation = await this.invitationRepository.findById(id);

        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${id} not found`);
        }

        if (tenantId !== undefined && invitation.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to invitation from different tenant');
        }

        return this.mapToDto(invitation);
    }

    async findInvitationByEmail(email: string, tenantId: string): Promise<InvitationDto | null> {
        const invitation = await this.invitationRepository.findByEmail(email, tenantId);
        return invitation ? this.mapToDto(invitation) : null;
    }
}