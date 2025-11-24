import { Injectable } from '@nestjs/common';
import { Team } from '../../domain/entities/team.entity';
import { TeamDto } from './dto/team.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class TeamMapper {
    toDto(team: Team): TeamDto {
        const dto = new TeamDto();

        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.tenant) {
            dto.tenant = {
                id: team.tenant.id,
                name: team.tenant.name,
            } as Pick<TenantDto, 'id' | 'name'>;
        }

        if (team.users) {
            dto.users = team.users.map((user) => ({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            })) as Pick<UserDto, 'id' | 'email' | 'firstName' | 'lastName'>[];
        }

        return dto;
    }
}
