import { ApiProperty } from '@nestjs/swagger';
import { TeamMemberDto } from './team-member.dto';

export class TeamDto {
    @ApiProperty({
        description: 'Unique identifier of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the team',
        example: 'Development Team',
    })
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Main development team working on core features',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Whether the team is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Tenant ID this team belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Team members',
        type: [TeamMemberDto],
        required: false,
    })
    members?: TeamMemberDto[];

    @ApiProperty({
        description: 'Date when the team was created',
        example: '2024-01-15T10:30:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2024-01-15T10:30:00Z',
    })
    updatedAt: Date;
}
