import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Development Team',
        minLength: 1,
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Main development team working on core features',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
