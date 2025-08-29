import { Role } from '../../domain/entities/role.entity';
import { RoleName } from '../../domain/enums/role-name.enum';

export interface IRoleRepository {
    findByName(name: RoleName): Promise<Role | null>;
    findById(id: string): Promise<Role | null>;
    findAll(): Promise<Role[]>;
    findByIds(ids: string[]): Promise<Role[]>;
}

export const ROLE_REPOSITORY = 'IRoleRepository';
