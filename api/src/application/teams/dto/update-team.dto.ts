import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Engineering Team',
        maxLength: 100,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Responsible for platform development',
        maxLength: 500,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}