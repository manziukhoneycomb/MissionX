import { ApiProperty } from '@nestjs/swagger';
import { TenantDto } from '../../tenants/dto/tenant.dto';

export class TeamResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    readonly id: string;

    @ApiProperty({
        description: 'Name of the team',
        example: 'Engineering Team',
    })
    readonly name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Team responsible for software development and engineering tasks',
        required: false,
    })
    readonly description?: string;

    @ApiProperty({
        description: 'Tenant the team belongs to',
        example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Company Name' },
    })
    readonly tenant: Pick<TenantDto, 'id' | 'name'>;

    @ApiProperty({
        description: 'Number of members in the team',
        example: 5,
    })
    readonly memberCount: number;

    @ApiProperty({
        description: 'Date when the team was created',
        example: '2023-01-01T12:00:00Z',
    })
    readonly createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2023-01-02T12:00:00Z',
    })
    readonly updatedAt: Date;
}

export class TeamMemberResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the team membership',
        example: '456e7890-a12b-34c5-d678-901234567890',
    })
    readonly id: string;

    @ApiProperty({
        description: 'User information',
        example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
        },
    })
    readonly user: {
        readonly id: string;
        readonly email: string;
        readonly firstName?: string;
        readonly lastName?: string;
    };

    @ApiProperty({
        description: 'Role of the user in the team',
        example: {
            id: '789a0123-b45c-67d8-e901-234567890123',
            name: 'Team Admin',
        },
    })
    readonly role: {
        readonly id: string;
        readonly name: string;
    };

    @ApiProperty({
        description: 'Date when the user joined the team',
        example: '2023-01-01T12:00:00Z',
    })
    readonly joinedAt: Date;
}
