import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Sales Team',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Responsible for all sales activities.',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
