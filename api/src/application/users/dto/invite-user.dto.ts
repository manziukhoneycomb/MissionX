import {
    IsEmail,
    IsNotEmpty,
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
        description: 'List of role IDs to assign to the invited user',
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

export class InvitationResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the invitation',
        example: 'inv_123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Email address that was invited',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'Current status of the invitation',
        example: 'pending',
        enum: ['pending', 'accepted', 'expired', 'revoked'],
    })
    status: string;

    @ApiProperty({
        description: 'Tenant ID the invitation is for',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Role names assigned to this invitation',
        example: ['Admin', 'User'],
        type: [String],
    })
    roles: string[];

    @ApiProperty({
        description: 'Date when the invitation was created',
        example: '2023-12-01T10:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the invitation expires',
        example: '2023-12-08T10:00:00.000Z',
    })
    expiresAt: Date;
}