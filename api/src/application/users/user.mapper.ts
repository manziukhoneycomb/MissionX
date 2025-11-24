import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserDto } from './dto/user.dto';
import { RoleDto } from '../roles/dto/role.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';

@Injectable()
export class UserMapper {
    toDto(entity: User): UserDto {
        const dto = new UserDto();

        dto.id = entity.id;
        dto.email = entity.email;
        dto.subId = entity.subId;
        dto.firstName = entity.firstName;
        dto.lastName = entity.lastName;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        dto.isActive = entity.isActive;

        if (entity.tenant) {
            dto.tenant = { id: entity.tenant.id, name: entity.tenant.name } as Pick<
                TenantDto,
                'id' | 'name'
            >;
        }

        if (entity.roles) {
            dto.roles = entity.roles.map((role) => {
                const roleDto = new RoleDto();
                roleDto.id = role.id;
                roleDto.name = role.name;
                roleDto.description = role.description;
                roleDto.createdAt = role.createdAt;
                roleDto.updatedAt = role.updatedAt;
                return roleDto;
            });
        }

        return dto;
    }

    toDtoList(entities: User[]): UserDto[] {
        return entities.map((entity) => this.toDto(entity));
    }
}