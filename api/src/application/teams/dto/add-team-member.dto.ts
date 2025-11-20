import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '../../../domain/enums/role-name.enum';

export class AddTeamMemberDto {
    @ApiProperty({
        description: 'ID of the user to add to the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'Role to assign to the team member',
        example: 'Team Member',
        enum: [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER],
    })
    @IsNotEmpty()
    @IsEnum(RoleName)
    role: RoleName;
}

export class UpdateTeamMemberRoleDto {
    @ApiProperty({
        description: 'New role to assign to the team member',
        example: 'Team Admin',
        enum: [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER],
    })
    @IsNotEmpty()
    @IsEnum(RoleName)
    role: RoleName;
}
