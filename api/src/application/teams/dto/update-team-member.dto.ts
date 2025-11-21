import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamMemberDto {
    @ApiProperty({
        description: 'ID of the team role to assign',
        example: '123e4567-e89b-12d3-a456-426614174002',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    teamRoleId?: string;

    @ApiProperty({
        description: 'Whether the team member is active',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
