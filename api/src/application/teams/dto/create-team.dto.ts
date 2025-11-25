import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTeamDto {
    @ApiProperty({ description: 'Name of the team', example: 'Engineering Team' })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        required: false,
        example: 'Team responsible for product development',
    })
    @IsOptional()
    @IsString()
    description?: string;
}
