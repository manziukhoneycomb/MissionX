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

export class InvitationDto {
    @ApiProperty({
        description: 'Invitation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Email address of the invited user',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'First name of the invited user',
        example: 'John',
        required: false,
    })
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the invited user',
        example: 'Doe',
        required: false,
    })
    lastName?: string;

    @ApiProperty({
        description: 'Tenant information',
        type: 'object',
        properties: {
            id: { type: 'string', description: 'Tenant ID' },
            name: { type: 'string', description: 'Tenant name' },
        },
    })
    tenant: {
        id: string;
        name: string;
    };

    @ApiProperty({
        description: 'Roles assigned to the invited user',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Role ID' },
                name: { type: 'string', description: 'Role name' },
            },
        },
    })
    roles: Array<{
        id: string;
        name: string;
    }>;

    @ApiProperty({
        description: 'Invitation status',
        example: 'pending',
        enum: ['pending', 'accepted', 'expired'],
    })
    status: string;

    @ApiProperty({
        description: 'Invitation creation date',
        example: '2023-01-01T00:00:00Z',
    })
    createdAt: string;

    @ApiProperty({
        description: 'Invitation expiration date',
        example: '2023-01-08T00:00:00Z',
    })
    expiresAt: string;

    @ApiProperty({
        description: 'User who sent the invitation',
        example: 'admin@company.com',
    })
    invitedBy: string;
}