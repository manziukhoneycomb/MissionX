import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../../../domain/entities/team.entity';

export class TeamMemberDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
    email: string;

    @ApiProperty({ description: 'First name of the user', required: false, example: 'John' })
    firstName?: string;

    @ApiProperty({ description: 'Last name of the user', required: false, example: 'Doe' })
    lastName?: string;
}

export class TeamDto {
    @ApiProperty({
        description: 'Unique identifier of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({ description: 'Name of the team', example: 'Engineering Team' })
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        required: false,
        example: 'Team responsible for product development',
    })
    description?: string;

    @ApiProperty({
        description: 'ID of the tenant the team belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Members of the team',
        type: [TeamMemberDto],
    })
    members: TeamMemberDto[];

    @ApiProperty({ description: 'Date when the team was created', example: '2023-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2023-01-02T12:00:00Z',
    })
    updatedAt: Date;

    static fromEntity(team: Team): TeamDto {
        const dto = new TeamDto();
        dto.id = team.id;
        dto.name = team.name;
        dto.description = team.description;
        dto.tenantId = team.tenantId;
        dto.createdAt = team.createdAt;
        dto.updatedAt = team.updatedAt;
        dto.members = team.members
            ? team.members.map((user) => ({
                  id: user.id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
              }))
            : [];
        return dto;
    }
}
