import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsArray, IsOptional } from 'class-validator';
import { RoleName } from '../../../domain/enums/role-name.enum';

export class AddTeamMemberDto {
    @ApiProperty({
        description: 'User ID to add to the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Team-specific roles to assign to the member',
        example: [RoleName.TEAM_MEMBER],
        enum: RoleName,
        isArray: true,
        required: false,
    })
    @IsOptional()
    @IsArray()
    teamRoles?: RoleName[];
}
