import { Role } from '../../../domain/entities/role.entity';

export const ROLES_QUERIES = Symbol('IRolesQueries');

export interface IRolesQueries {
    findAllRoles(): Promise<Role[]>;
}
