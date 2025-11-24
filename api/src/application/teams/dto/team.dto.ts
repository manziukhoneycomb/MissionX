import { ApiProperty } from '@nestjs/swagger';

export class TeamDto {
    @ApiProperty({
        description: 'The unique identifier of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the team',
        example: 'Development Team',
        maxLength: 255,
    })
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Responsible for product development',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'ID of the tenant this team belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Number of users in the team',
        example: 5,
    })
    userCount: number;

    @ApiProperty({
        description: 'Date when the team was created',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}