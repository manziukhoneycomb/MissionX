import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '../../../domain/enums/role-name.enum';

export class RoleDto {
    @ApiProperty({
        description: 'Unique identifier of the role',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the role',
        enum: RoleName,
        example: RoleName.ADMIN,
    })
    name: RoleName;
}
