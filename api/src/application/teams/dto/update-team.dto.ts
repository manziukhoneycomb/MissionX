import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Development Team',
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
        maxLength: 500,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({
        description: 'Whether the team is active',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
