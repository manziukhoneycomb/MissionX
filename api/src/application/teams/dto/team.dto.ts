import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberDto {
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'User first name',
        example: 'John',
        required: false,
    })
    firstName?: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        required: false,
    })
    lastName?: string;
}

export class TeamDto {
    @ApiProperty({
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Team name',
        example: 'Engineering Team',
    })
    name: string;

    @ApiProperty({
        description: 'Team description',
        example: 'Software development and engineering team',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Tenant ID',
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
        description: 'Created timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Updated timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}
