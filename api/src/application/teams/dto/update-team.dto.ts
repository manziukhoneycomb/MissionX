import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamDto {
    @ApiProperty({
        description: 'The name of the team',
        example: 'Engineering Team',
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the team',
        example: 'This team handles all engineering tasks',
    })
    @IsString()
    @IsOptional()
    description?: string;
}