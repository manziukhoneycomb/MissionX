import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeamDto {
    @ApiProperty({
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    readonly id: string;

    @ApiProperty({
        description: 'Name of the team',
        example: 'Development Team',
    })
    readonly name: string;

    @ApiPropertyOptional({
        description: 'Description of the team',
        example: 'Team responsible for product development',
    })
    readonly description?: string;

    @ApiProperty({
        description: 'Tenant ID that owns this team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    readonly tenantId: string;

    @ApiProperty({
        description: 'Team creation date',
        example: '2024-01-15T10:30:00.000Z',
    })
    readonly createdAt: Date;

    @ApiProperty({
        description: 'Team last update date',
        example: '2024-01-15T10:30:00.000Z',
    })
    readonly updatedAt: Date;
}
