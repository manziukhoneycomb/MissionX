import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Engineering Team',
        maxLength: 255,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Team responsible for product development',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
