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

export class InviteUserDto {
    @ApiProperty({
        description: 'Email address of the user to invite',
        example: 'user@example.com',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        description: 'First name of the user to invite',
        example: 'John',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the user to invite',
        example: 'Doe',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @ApiProperty({
        description: 'List of role IDs to assign to the user upon acceptance',
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

    @ApiProperty({
        description: 'Custom invitation message (optional)',
        example: 'Welcome to our team! Please accept this invitation to join our workspace.',
        required: false,
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    message?: string;
}

export class InviteResponseDto {
    @ApiProperty({
        description: 'Invitation ID from Clerk',
        example: 'inv_123456789',
    })
    invitationId: string;

    @ApiProperty({
        description: 'Email address of the invited user',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'Status of the invitation',
        example: 'pending',
        enum: ['pending', 'accepted', 'revoked'],
    })
    status: string;

    @ApiProperty({
        description: 'Tenant ID the user was invited to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Role IDs assigned to the invitation',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
    })
    roleIds: string[];

    @ApiProperty({
        description: 'Date when the invitation was created',
        example: '2023-12-01T10:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the invitation expires',
        example: '2023-12-08T10:00:00Z',
    })
    expiresAt: Date;
}