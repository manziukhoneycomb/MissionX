import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { IUserQueries } from './interfaces/user-queries.interface';
import { UserDto } from './dto/user.dto';
import { RoleDto } from '../roles/dto/role.dto';

@Injectable()
export class UserQueries implements IUserQueries {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    private mapToDto(user: User | null): UserDto | null {
        if (!user) {
            return null;
        }

        const dto = new UserDto();

        dto.id = user.id;
        dto.email = user.email;
        dto.subId = user.subId;
        dto.firstName = user.firstName;
        dto.lastName = user.lastName;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;
        dto.isActive = user.isActive;

        if (user.tenant) {
            dto.tenant = { id: user.tenant.id, name: user.tenant.name };
        }

        if (user.roles) {
            dto.roles = user.roles.map((role) => {
                const roleDto = new RoleDto();
                roleDto.id = role.id;
                roleDto.name = role.name;
                return roleDto;
            });
        }

        return dto;
    }

    async findAllUsersByTenant(tenantId: string): Promise<UserDto[]> {
        const users = await this.userRepository.findAllByTenantId(tenantId);

        return users.map((user) => this.mapToDto(user)).filter(Boolean) as UserDto[];
    }

    async findAllUsers(): Promise<UserDto[]> {
        const users = await this.userRepository.findAll();

        return users.map((user) => this.mapToDto(user)).filter(Boolean) as UserDto[];
    }

    async findUserById(id: string, requestingUserTenantId?: string): Promise<UserDto> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (requestingUserTenantId !== undefined && user.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Access denied to user from different tenant.');
        }

        const dto = this.mapToDto(user);

        if (!dto) {
            throw new InternalServerErrorException('Failed to map found user.');
        }

        return dto;
    }

    async findUserByEmail(email: string): Promise<UserDto | null> {
        const user = await this.userRepository.findByEmail(email);

        return this.mapToDto(user);
    }

    async findUserBySubId(subId: string): Promise<UserDto | null> {
        const user = await this.userRepository.findBySubId(subId);

        return this.mapToDto(user);
    }
}
