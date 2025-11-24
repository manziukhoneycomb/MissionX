import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

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

    @ApiPropertyOptional({
        description: 'Team description',
        example: 'This team handles all engineering tasks',
    })
    description?: string;

    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    tenantId: string;

    @ApiProperty({
        description: 'List of team members',
        type: [UserDto],
    })
    users: UserDto[];

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
}