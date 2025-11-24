import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Engineering',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Engineering team members',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
