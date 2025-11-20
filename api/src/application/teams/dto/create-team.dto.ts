import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Development Team',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    readonly name: string;

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
