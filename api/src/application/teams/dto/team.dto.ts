import { ApiProperty } from '@nestjs/swagger';

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
        nullable: true,
    })
    description?: string;

    @ApiProperty({
        description: 'ID of the tenant that owns this team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Timestamp when the team was created',
        example: '2023-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the team was last updated',
        example: '2023-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}