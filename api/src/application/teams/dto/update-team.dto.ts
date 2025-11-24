import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Engineering',
        maxLength: 255,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Engineering team members',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
