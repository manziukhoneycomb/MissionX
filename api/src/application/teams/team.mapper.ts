import { Injectable } from '@nestjs/common';
import { Team } from '../../domain/entities/team.entity';
import { TeamDto } from './dto/team.dto';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class TeamMapper {
    toDto(entity: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.description = entity.description;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;

        if (entity.users) {
            dto.users = entity.users.map((user) => {
                const userDto = new UserDto();
                userDto.id = user.id;
                userDto.email = user.email;
                userDto.firstName = user.firstName;
                userDto.lastName = user.lastName;
                userDto.isActive = user.isActive;
                return userDto;
            });
        } else {
            dto.users = [];
        }

        return dto;
    }
}
