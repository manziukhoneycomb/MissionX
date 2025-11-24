import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

    @ApiProperty({
        description: 'Description of the team',
        example: 'Responsible for product development',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'List of user IDs to add to the team',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    userIds?: string[];
}

export class CreateTeamBySuperAdminDto extends CreateTeamDto {
    @ApiProperty({
        description: 'ID of the tenant to assign the team to (required for super admin)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsString()
    tenantId: string;
}