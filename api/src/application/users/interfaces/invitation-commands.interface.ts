import { InviteUserDto, InvitationDto } from '../dto/invite-user.dto';

export const INVITATION_COMMANDS = Symbol('IInvitationCommands');

export interface IInvitationCommands {
    inviteUser(inviteUserDto: InviteUserDto, tenantId: string, invitedBy: string): Promise<InvitationDto>;
    resendInvitation(invitationId: string, tenantId: string): Promise<InvitationDto>;
    cancelInvitation(invitationId: string, tenantId: string): Promise<void>;
    acceptInvitation(invitationId: string, userSubId: string): Promise<InvitationDto>;
}