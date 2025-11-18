import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamDto {
    @ApiPropertyOptional({
        description: 'Name of the team',
        example: 'Development Team',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        description: 'Description of the team',
        example: 'Team responsible for product development',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        description: 'Whether the team is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}