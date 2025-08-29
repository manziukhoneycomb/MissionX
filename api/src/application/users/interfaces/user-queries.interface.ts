import { UserDto } from '../dto/user.dto';

export interface IUserQueries {
    findAllUsersByTenant(tenantId: string): Promise<UserDto[]>;
    findAllUsers(): Promise<UserDto[]>;
    findUserById(id: string, requestingUserTenantId?: string): Promise<UserDto>;
    findUserByEmail(email: string): Promise<UserDto | null>;
    findUserBySubId(subId: string): Promise<UserDto | null>;
}

export const USER_QUERIES = 'IUserQueries';
