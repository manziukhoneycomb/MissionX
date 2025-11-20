import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';
import { RoleDto } from '../../roles/dto/role.dto';

export class TeamMemberDto {
    @ApiProperty({
        description: 'Unique identifier of the team member',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    teamId: string;

    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    userId: string;

    @ApiProperty({
        description: 'Whether the team member is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'User details',
        type: UserDto,
        required: false,
    })
    user?: UserDto;

    @ApiProperty({
        description: 'Team-specific roles for this member',
        type: [RoleDto],
        required: false,
    })
    teamRoles?: RoleDto[];

    @ApiProperty({
        description: 'Date when the member joined the team',
        example: '2024-01-15T10:30:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the member record was last updated',
        example: '2024-01-15T10:30:00Z',
    })
    updatedAt: Date;
}
