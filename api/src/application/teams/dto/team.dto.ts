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
        description: 'Tenant ID the team belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'List of team members',
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
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            tenantId: team.tenantId,
            members: team.members
                ? team.members.map((member) => ({
                      id: member.id,
                      email: member.email,
                      firstName: member.firstName,
                      lastName: member.lastName,
                  }))
                : [],
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };
    }
}
