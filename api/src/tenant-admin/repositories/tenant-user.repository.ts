import { Injectable, Inject, Logger } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { RoleName } from '../../domain/enums/role-name.enum';

export interface ITenantUserRepository {
    findTenantUsersByTenantId(tenantId: string): Promise<User[]>;
    findTenantUserById(userId: string, tenantId: string): Promise<User | null>;
    findTenantAdminsByTenantId(tenantId: string): Promise<User[]>;
    countUsersByTenantId(tenantId: string): Promise<number>;
    findActiveUsersByTenantId(tenantId: string): Promise<User[]>;
    findInactiveUsersByTenantId(tenantId: string): Promise<User[]>;
}

export const TENANT_USER_REPOSITORY = 'TENANT_USER_REPOSITORY';

@Injectable()
export class TenantUserRepository implements ITenantUserRepository {
    private readonly logger = new Logger(TenantUserRepository.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async findTenantUsersByTenantId(tenantId: string): Promise<User[]> {
        this.logger.debug(`Finding users for tenant: ${tenantId}`);
        return await this.userRepository.findAllByTenantId(tenantId);
    }

    async findTenantUserById(userId: string, tenantId: string): Promise<User | null> {
        this.logger.debug(`Finding user ${userId} for tenant: ${tenantId}`);
        const user = await this.userRepository.findById(userId);
        
        if (!user || user.tenantId !== tenantId) {
            return null;
        }

        return user;
    }

    async findTenantAdminsByTenantId(tenantId: string): Promise<User[]> {
        this.logger.debug(`Finding admin users for tenant: ${tenantId}`);
        const users = await this.userRepository.findAllByTenantId(tenantId);
        
        return users.filter(user => 
            user.roles?.some(role => role.name === RoleName.ADMIN)
        );
    }

    async countUsersByTenantId(tenantId: string): Promise<number> {
        this.logger.debug(`Counting users for tenant: ${tenantId}`);
        const users = await this.userRepository.findAllByTenantId(tenantId);
        return users.length;
    }

    async findActiveUsersByTenantId(tenantId: string): Promise<User[]> {
        this.logger.debug(`Finding active users for tenant: ${tenantId}`);
        const users = await this.userRepository.findAllByTenantId(tenantId);
        return users.filter(user => user.isActive);
    }

    async findInactiveUsersByTenantId(tenantId: string): Promise<User[]> {
        this.logger.debug(`Finding inactive users for tenant: ${tenantId}`);
        const users = await this.userRepository.findAllByTenantId(tenantId);
        return users.filter(user => !user.isActive);
    }
}