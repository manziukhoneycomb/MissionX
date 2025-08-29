import { TenantDto } from '../../tenants/dto/tenant.dto';
import { RoleDto } from '../../roles/dto/role.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
    email: string;

    @ApiProperty({
        description: 'External identity provider subject ID',
        required: false,
        example: 'auth0|123456789',
    })
    subId?: string;

    @ApiProperty({ description: 'First name of the user', required: false, example: 'John' })
    firstName?: string;

    @ApiProperty({ description: 'Last name of the user', required: false, example: 'Doe' })
    lastName?: string;

    @ApiProperty({
        description: 'Tenant the user belongs to',
        example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Company Name' },
    })
    tenant: Pick<TenantDto, 'id' | 'name'>;

    @ApiProperty({
        description: 'Roles assigned to the user',
        type: [RoleDto],
    })
    roles: RoleDto[];

    @ApiProperty({ description: 'Date when the user was created', example: '2023-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the user was last updated',
        example: '2023-01-02T12:00:00Z',
    })
    updatedAt: Date;

    @ApiProperty({ description: 'Indicates if the user account is active', example: true })
    isActive: boolean;
}
