import { User } from '../../domain/entities/user.entity';
import {
    CreateUserDto,
    CreateUserBySuperAdminDto,
} from '../../application/users/dto/create-user.dto';
import { UpdateUserDto } from '../../application/users/dto/update-user.dto';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findBySubId(subId: string): Promise<User | null>;
    findAllByTenantId(tenantId: string): Promise<User[]>;
    findAll(): Promise<User[]>;
    create(
        dto: CreateUserDto | CreateUserBySuperAdminDto,
        tenantId?: string,
        subId?: string,
    ): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    activate(id: string): Promise<void>;
    deactivate(id: string): Promise<void>;
}

export const USER_REPOSITORY = 'IUserRepository';
