import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '../../../domain/enums/role-name.enum';

export class TeamMemberDto {
    @ApiProperty({
        description: 'Team role ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    teamId: string;

    @ApiProperty({
        description: 'User ID of the team member',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    userId: string;

    @ApiProperty({
        description: 'Email of the team member',
        example: 'john.doe@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'First name of the team member',
        example: 'John',
        nullable: true,
    })
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the team member',
        example: 'Doe',
        nullable: true,
    })
    lastName?: string;

    @ApiProperty({
        description: 'Role of the member in the team',
        example: RoleName.TEAM_MEMBER,
        enum: [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER],
    })
    role: RoleName;

    @ApiProperty({
        description: 'Whether the team member is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Timestamp when the member joined the team',
        example: '2023-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the team role was last updated',
        example: '2023-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}