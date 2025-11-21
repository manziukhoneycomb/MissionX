import {
    Injectable,
    Inject,
    NotFoundException,
    ConflictException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { IInvitationRepository, INVITATION_REPOSITORY } from '../repositories/invitation.repository.interface';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../repositories/role.repository.interface';
import { ITenantRepository, TENANT_REPOSITORY } from '../repositories/tenant.repository.interface';
import { IInvitationCommands } from './interfaces/invitation-commands.interface';
import { InviteUserDto, InvitationDto } from './dto/invite-user.dto';
import { Invitation, InvitationStatus } from '../../domain/entities/invitation.entity';

@Injectable()
export class InvitationCommands implements IInvitationCommands {
    constructor(
        @Inject(INVITATION_REPOSITORY)
        private readonly invitationRepository: IInvitationRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: ITenantRepository,
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

    async inviteUser(inviteUserDto: InviteUserDto, tenantId: string, invitedBy: string): Promise<InvitationDto> {
        const existingUser = await this.userRepository.findByEmail(inviteUserDto.email);
        if (existingUser && existingUser.tenantId === tenantId) {
            throw new ConflictException('User already exists in this tenant');
        }

        const existingInvitation = await this.invitationRepository.findByEmail(inviteUserDto.email, tenantId);
        if (existingInvitation && existingInvitation.status === InvitationStatus.PENDING) {
            throw new ConflictException('User already has a pending invitation');
        }

        const tenant = await this.tenantRepository.findById(tenantId);
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        const roles = await this.roleRepository.findByIds(inviteUserDto.roleIds);
        if (roles.length !== inviteUserDto.roleIds.length) {
            throw new BadRequestException('One or more role IDs are invalid');
        }

        const invitation = new Invitation();
        invitation.email = inviteUserDto.email;
        invitation.firstName = inviteUserDto.firstName;
        invitation.lastName = inviteUserDto.lastName;
        invitation.tenantId = tenantId;
        invitation.tenant = tenant;
        invitation.roles = roles;
        invitation.invitedBy = invitedBy;
        invitation.status = InvitationStatus.PENDING;
        
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        invitation.expiresAt = expirationDate;

        const savedInvitation = await this.invitationRepository.save(invitation);
        
        return this.mapToDto(savedInvitation);
    }

    async resendInvitation(invitationId: string, tenantId: string): Promise<InvitationDto> {
        const invitation = await this.invitationRepository.findById(invitationId);
        
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to invitation from different tenant');
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new BadRequestException('Can only resend pending invitations');
        }

        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + 7);

        const updatedInvitation = await this.invitationRepository.update(invitationId, {
            expiresAt: newExpirationDate,
        });

        return this.mapToDto(updatedInvitation);
    }

    async cancelInvitation(invitationId: string, tenantId: string): Promise<void> {
        const invitation = await this.invitationRepository.findById(invitationId);
        
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to invitation from different tenant');
        }

        await this.invitationRepository.delete(invitationId);
    }

    async acceptInvitation(invitationId: string, userSubId: string): Promise<InvitationDto> {
        const invitation = await this.invitationRepository.findById(invitationId);
        
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new BadRequestException('Invitation is not pending');
        }

        if (invitation.expiresAt < new Date()) {
            throw new BadRequestException('Invitation has expired');
        }

        const updatedInvitation = await this.invitationRepository.update(invitationId, {
            status: InvitationStatus.ACCEPTED,
        });

        return this.mapToDto(updatedInvitation);
    }
}