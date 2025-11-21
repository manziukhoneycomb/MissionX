import { InvitationDto } from '../dto/invite-user.dto';

export const INVITATION_QUERIES = Symbol('IInvitationQueries');

export interface IInvitationQueries {
    findInvitationsByTenant(tenantId: string): Promise<InvitationDto[]>;
    findInvitationById(id: string, tenantId?: string): Promise<InvitationDto>;
    findInvitationByEmail(email: string, tenantId: string): Promise<InvitationDto | null>;
}