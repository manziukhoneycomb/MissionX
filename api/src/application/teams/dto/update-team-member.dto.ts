import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsBoolean } from 'class-validator';
import { RoleName } from '../../../domain/enums/role-name.enum';

export class UpdateTeamMemberDto {
    @ApiPropertyOptional({
        description: 'Team-specific roles to assign to the member',
        example: [RoleName.TEAM_ADMIN],
        enum: RoleName,
        isArray: true,
    })
    @IsOptional()
    @IsArray()
    teamRoles?: RoleName[];

    @ApiPropertyOptional({
        description: 'Whether the team member is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
