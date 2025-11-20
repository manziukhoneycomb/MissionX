import { IsOptional, IsString, MaxLength, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamRoleDto {
    @ApiPropertyOptional({
        description: 'Role name',
        example: 'Updated Team Lead',
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        description: 'Role permissions',
        example: { canManageMembers: true, canEditTeam: true },
    })
    @IsOptional()
    @IsObject()
    permissions?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Whether this role inherits from global roles',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    inheritFromGlobalRole?: boolean;
}