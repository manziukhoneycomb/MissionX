import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    IsArray,
    ArrayNotEmpty,
    ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Email address of the user',
        example: 'user@example.com',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        description: 'External identity provider subject ID',
        example: 'auth0|123456789',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    subId?: string;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @ApiProperty({
        description: 'List of role IDs to assign to the user',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
        minItems: 1,
    })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    roleIds: string[];
}

export class CreateUserBySuperAdminDto extends CreateUserDto {
    @ApiProperty({
        description: 'ID of the tenant to assign the user to (required for super admin)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsString()
    tenantId?: string;
}
