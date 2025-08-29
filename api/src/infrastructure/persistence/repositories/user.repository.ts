import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../application/repositories/user.repository.interface';
import {
    IRoleRepository,
    ROLE_REPOSITORY,
} from '../../../application/repositories/role.repository.interface';
import {
    CreateUserDto,
    CreateUserBySuperAdminDto,
} from '../../../application/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../application/users/dto/update-user.dto';

@Injectable()
export class UserRepository implements IUserRepository {
    private readonly logger = new Logger(UserRepository.name);

    constructor(
        @InjectRepository(User)
        private readonly ormRepository: Repository<User>,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) {}

    async findById(id: string): Promise<User | null> {
        return this.ormRepository.findOne({ where: { id }, relations: ['tenant', 'roles'] });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.ormRepository.findOne({ where: { email }, relations: ['tenant', 'roles'] });
    }

    async findBySubId(subId: string): Promise<User | null> {
        return this.ormRepository.findOne({ where: { subId }, relations: ['tenant', 'roles'] });
    }

    async findAllByTenantId(tenantId: string): Promise<User[]> {
        return this.ormRepository.find({ where: { tenantId }, relations: ['tenant', 'roles'] });
    }

    async findAll(): Promise<User[]> {
        return this.ormRepository.find({ relations: ['tenant', 'roles'] });
    }

    async create(
        dto: CreateUserDto | CreateUserBySuperAdminDto,
        tenantId?: string,
        subId?: string,
    ): Promise<User> {
        const { roleIds, ...userData } = dto;
        const user = this.ormRepository.create({
            ...userData,
            subId,
            tenantId,
        });

        if (roleIds && roleIds.length > 0) {
            const roles = await this.roleRepository.findByIds(roleIds);

            if (roles.length !== roleIds.length) {
                const foundIds = roles.map((r) => r.id);
                const notFoundIds = roleIds.filter((id) => !foundIds.includes(id));

                this.logger.warn(
                    `CreateUser: Could not find all roles for IDs: ${notFoundIds.join(', ')}`,
                );

                throw new BadRequestException(`Invalid Role ID(s): ${notFoundIds.join(', ')}`);
            }
            user.roles = roles;
        } else {
            user.roles = [];
        }

        return await this.ormRepository.save(user);
    }

    async update(id: string, dto: UpdateUserDto): Promise<User | null> {
        const user = await this.findById(id);

        if (!user) {
            this.logger.warn(`User with ID ${id} not found for update.`);
            return null;
        }

        const { roleIds, ...updateData } = dto;
        this.ormRepository.merge(user, updateData);

        if (roleIds !== undefined) {
            if (roleIds.length > 0) {
                const roles = await this.roleRepository.findByIds(roleIds);
                if (roles.length !== roleIds.length) {
                    const foundIds = roles.map((r) => r.id);
                    const notFoundIds = roleIds.filter((id) => !foundIds.includes(id));
                    this.logger.warn(
                        `UpdateUser: Could not find all roles for IDs: ${notFoundIds.join(', ')}`,
                    );
                    throw new BadRequestException(`Invalid Role ID(s): ${notFoundIds.join(', ')}`);
                }
                user.roles = roles;
            } else {
                user.roles = [];
            }
        }

        return await this.ormRepository.save(user);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);

        return !!result?.affected && result.affected > 0;
    }

    async activate(id: string): Promise<void> {
        const user = await this.findById(id);

        if (!user) {
            return;
        }

        user.isActive = true;

        await this.ormRepository.save(user);
    }

    async deactivate(id: string): Promise<void> {
        const user = await this.findById(id);

        if (!user) {
            return;
        }

        user.isActive = false;

        await this.ormRepository.save(user);
    }
}
