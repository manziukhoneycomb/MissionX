import { UserDto } from '../dto/user.dto';
import { InvitationStatus } from '../services/clerk-invite.service';

export interface IUserQueries {
    findAllUsersByTenant(tenantId: string): Promise<UserDto[]>;
    findAllUsers(): Promise<UserDto[]>;
    findUserById(id: string, requestingUserTenantId?: string): Promise<UserDto>;
    findUserByEmail(email: string): Promise<UserDto | null>;
    findUserBySubId(subId: string): Promise<UserDto | null>;
    findTenantInvitations(tenantId: string): Promise<InvitationStatus[]>;
    findInvitationById(invitationId: string): Promise<InvitationStatus | null>;
}

export const USER_QUERIES = 'IUserQueries';
