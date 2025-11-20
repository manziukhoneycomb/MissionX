import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberDto {
    @ApiProperty({
        description: 'ID of the team member',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'ID of the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    userId: string;

    @ApiProperty({
        description: 'Role of the team member',
        example: 'Team Member',
        enum: ['Team Owner', 'Team Admin', 'Team Member'],
    })
    role: string;

    @ApiProperty({
        description: 'Date when the user joined the team',
        example: '2023-01-01T00:00:00.000Z',
    })
    joinedAt: Date;

    @ApiProperty({
        description: 'User information',
        required: false,
    })
    user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
}

export class TeamResponseDto {
    @ApiProperty({
        description: 'ID of the team',
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
        description: 'ID of the tenant',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Date when the team was created',
        example: '2023-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2023-01-01T00:00:00.000Z',
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'Team members',
        type: [TeamMemberDto],
        required: false,
    })
    teamMembers?: TeamMemberDto[];

    @ApiProperty({
        description: 'Tenant information',
        required: false,
    })
    tenant?: {
        id: string;
        name: string;
    };
}
