import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamDto {
    @ApiPropertyOptional({
        description: 'Name of the team',
        example: 'Updated Development Team',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        description: 'Description of the team',
        example: 'Updated team description',
    })
    @IsOptional()
    @IsString()
    description?: string;
}