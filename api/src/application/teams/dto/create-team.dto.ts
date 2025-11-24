import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
    @ApiProperty({
        description: 'Name of the team',
        example: 'Engineering Team',
        maxLength: 100,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Responsible for platform development',
        maxLength: 500,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    description: string;

    @ApiProperty({
        description: 'ID of the tenant to assign the team to (required for super admin)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsString()
    tenantId?: string;
}