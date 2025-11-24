import { Injectable } from '@nestjs/common';
import { Team } from '../../domain/entities/team.entity';
import { TeamDto } from './dto/team.dto';

@Injectable()
export class TeamMapper {
    toDto(entity: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.description = entity.description;
        dto.tenantId = entity.tenantId;
        dto.userCount = entity.users ? entity.users.length : 0;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;

        return dto;
    }

    toDtoList(entities: Team[]): TeamDto[] {
        return entities.map((entity) => this.toDto(entity));
    }
}