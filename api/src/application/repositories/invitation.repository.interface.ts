import { Invitation } from '../../domain/entities/invitation.entity';

export const INVITATION_REPOSITORY = Symbol('IInvitationRepository');

export interface IInvitationRepository {
    save(invitation: Invitation): Promise<Invitation>;
    findById(id: string): Promise<Invitation | null>;
    findByEmail(email: string, tenantId: string): Promise<Invitation | null>;
    findAllByTenantId(tenantId: string): Promise<Invitation[]>;
    findActiveByEmail(email: string): Promise<Invitation | null>;
    update(id: string, invitation: Partial<Invitation>): Promise<Invitation>;
    delete(id: string): Promise<void>;
    findExpiredInvitations(): Promise<Invitation[]>;
}