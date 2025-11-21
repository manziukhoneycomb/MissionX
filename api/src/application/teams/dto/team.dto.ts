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
        example: 'Team responsible for product development',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Whether the team is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'ID of the tenant that owns this team',
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
        description: 'Creation timestamp',
        example: '2023-01-01T00:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-01-01T00:00:00Z',
    })
    updatedAt: Date;
}
