import { IsOptional, IsString, MaxLength } from 'class-validator';
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
    readonly name?: string;

    @ApiPropertyOptional({
        description: 'Description of the team',
        example: 'Team responsible for product development',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    readonly description?: string;
}
