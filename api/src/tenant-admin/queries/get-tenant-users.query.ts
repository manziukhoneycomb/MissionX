import {
    Injectable,
    Inject,
    ForbiddenException,
} from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { TenantUserDto } from '../dto/tenant-user.dto';
import { RoleDto } from '../../application/roles/dto/role.dto';

@Injectable()
export class GetTenantUsersQuery {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    private mapToTenantUserDto(user: User): TenantUserDto {
        const dto = new TenantUserDto();

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
        } else {
            dto.roles = [];
        }

        dto.hasAcceptedInvitation = !!user.subId;

        return dto;
    }

    async execute(requestingUserTenantId: string): Promise<TenantUserDto[]> {
        if (!requestingUserTenantId) {
            throw new ForbiddenException('Tenant ID is required to access tenant users.');
        }

        const users = await this.userRepository.findAllByTenantId(requestingUserTenantId);

        return users.map((user) => this.mapToTenantUserDto(user));
    }
}