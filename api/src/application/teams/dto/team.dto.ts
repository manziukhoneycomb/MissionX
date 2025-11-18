import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { TeamRoleName } from '../../../domain/enums/team-role-name.enum';

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

    @ApiPropertyOptional({
        description: 'Description of the team',
        example: 'Team responsible for product development',
    })
    description?: string;

    @ApiProperty({
        description: 'Whether the team is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'ID of the tenant this team belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Date when the team was created',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the team was last updated',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}

export class TeamMemberDto {
    @ApiProperty({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    userId: string;

    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
    })
    email: string;

    @ApiPropertyOptional({
        description: 'User first name',
        example: 'John',
    })
    firstName?: string;

    @ApiPropertyOptional({
        description: 'User last name',
        example: 'Doe',
    })
    lastName?: string;

    @ApiProperty({
        description: 'Team role',
        enum: TeamRoleName,
        example: TeamRoleName.TEAM_MEMBER,
    })
    teamRole: TeamRoleName;

    @ApiProperty({
        description: 'Date when the user joined the team',
        example: '2024-01-01T00:00:00.000Z',
    })
    joinedAt: Date;
}

export class AddTeamMemberDto {
    @ApiProperty({
        description: 'User ID to add to the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Team role for the user',
        enum: TeamRoleName,
        example: TeamRoleName.TEAM_MEMBER,
    })
    @IsNotEmpty()
    @IsEnum(TeamRoleName)
    teamRole: TeamRoleName;
}

export class UpdateTeamMemberRoleDto {
    @ApiProperty({
        description: 'New team role for the user',
        enum: TeamRoleName,
        example: TeamRoleName.TEAM_ADMIN,
    })
    @IsNotEmpty()
    @IsEnum(TeamRoleName)
    teamRole: TeamRoleName;
}