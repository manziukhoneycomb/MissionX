import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';
import { TenantDto } from '../../tenants/dto/tenant.dto';

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
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Tenant the team belongs to',
        example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Company Name' },
    })
    tenant: Pick<TenantDto, 'id' | 'name'>;

    @ApiProperty({
        description: 'Users assigned to the team',
        type: [UserDto],
    })
    users: UserDto[];

    @ApiProperty({
        description: 'Date when the team was created',
        example: '2023-01-01T12:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2023-01-02T12:00:00Z',
    })
    updatedAt: Date;
}