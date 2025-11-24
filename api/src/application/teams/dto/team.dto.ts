import { ApiProperty } from '@nestjs/swagger';

export class TeamDto {
    @ApiProperty({
        description: 'Unique identifier of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the team',
        example: 'Engineering',
    })
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Engineering team members',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'ID of the tenant this team belongs to',
    })
    tenantId: string;
}
