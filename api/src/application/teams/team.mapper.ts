import { Injectable } from '@nestjs/common';
import { Team } from '../../domain/entities/team.entity';
import { TeamDto, TeamMemberDto } from './dto/team.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';

@Injectable()
export class TeamMapper {
    mapToDto(team: Team | null): TeamDto | null {
        if (!team) {
            return null;
        }

        const dto = new TeamDto();

        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;

        if (team.tenant) {
            dto.tenant = { 
                id: team.tenant.id, 
                name: team.tenant.name 
            } as Pick<TenantDto, 'id' | 'name'>;
        }

        if (team.users) {
            dto.users = team.users.map(user => {
                const memberDto = new TeamMemberDto();
                memberDto.id = user.id;
                memberDto.email = user.email;
                memberDto.firstName = user.firstName;
                memberDto.lastName = user.lastName;
                return memberDto;
            });
        } else {
            dto.users = [];
        }

        return dto;
    }

    mapToDtoArray(teams: Team[]): TeamDto[] {
        return teams.map(team => this.mapToDto(team)).filter(dto => dto !== null) as TeamDto[];
    }
}