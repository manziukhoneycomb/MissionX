import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberDto {
    @ApiProperty({
        description: 'Unique identifier of the team member record',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'ID of the team',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    teamId: string;

    @ApiProperty({
        description: 'ID of the user',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    userId: string;

    @ApiProperty({
        description: 'ID of the team role',
        example: '123e4567-e89b-12d3-a456-426614174003',
    })
    teamRoleId: string;

    @ApiProperty({
        description: 'User information',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
        },
        required: false,
    })
    user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };

    @ApiProperty({
        description: 'Team role information',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Team Member',
            description: 'Standard team member',
        },
        required: false,
    })
    teamRole?: {
        id: string;
        name: string;
        description?: string;
    };

    @ApiProperty({
        description: 'Whether the team member is active',
        example: true,
    })
    isActive: boolean;

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
