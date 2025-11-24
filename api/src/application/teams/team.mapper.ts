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
        dto.tenant = entity.tenant ? {
            id: entity.tenant.id,
            name: entity.tenant.name,
        } : { 
            id: entity.tenantId, 
            name: '' 
        };
        dto.users = entity.users || [];
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;

        return dto;
    }

    toDtoList(entities: Team[]): TeamDto[] {
        return entities.map((entity) => this.toDto(entity));
    }
}