import { ApiProperty } from '@nestjs/swagger';
import { TenantDto } from '../../tenants/dto/tenant.dto';
import { UserDto } from '../../users/dto/user.dto';

export class TeamMemberDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
    email: string;

    @ApiProperty({ description: 'First name of the user', required: false, example: 'John' })
    firstName?: string;

    @ApiProperty({ description: 'Last name of the user', required: false, example: 'Doe' })
    lastName?: string;
}

export class TeamDto {
    @ApiProperty({
        description: 'Unique identifier of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({ description: 'Name of the team', example: 'Engineering Team' })
    name: string;

    @ApiProperty({ description: 'Description of the team', example: 'Responsible for platform development' })
    description: string;

    @ApiProperty({
        description: 'Tenant the team belongs to',
        example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Company Name' },
    })
    tenant: Pick<TenantDto, 'id' | 'name'>;

    @ApiProperty({
        description: 'Team members',
        type: [TeamMemberDto],
    })
    users: TeamMemberDto[];

    @ApiProperty({ description: 'Date when the team was created', example: '2023-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2023-01-02T12:00:00Z',
    })
    updatedAt: Date;
}