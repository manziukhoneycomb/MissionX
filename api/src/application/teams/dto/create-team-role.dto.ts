import { IsNotEmpty, IsString, MaxLength, IsUUID, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamRoleDto {
    @ApiProperty({
        description: 'Team ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    teamId: string;

    @ApiProperty({
        description: 'Role name',
        example: 'Team Lead',
        maxLength: 100,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({
        description: 'Role permissions',
        example: { canManageMembers: true, canEditTeam: false },
    })
    @IsOptional()
    @IsObject()
    permissions?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Whether this role inherits from global roles',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    inheritFromGlobalRole?: boolean;
}