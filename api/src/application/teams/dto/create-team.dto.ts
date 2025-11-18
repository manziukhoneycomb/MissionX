import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID } from 'class-validator';
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
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the team',
        example: 'Team responsible for product development',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({
        description: 'ID of the tenant this team belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    tenantId: string;
}