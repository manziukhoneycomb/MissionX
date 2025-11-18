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
        example: 'newuser@example.com',
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

export class InviteUserResponseDto {
    @ApiProperty({
        description: 'Clerk invitation ID',
        example: 'inv_1234567890',
    })
    invitationId: string;

    @ApiProperty({
        description: 'Email address of the invited user',
        example: 'newuser@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'Status of the invitation',
        example: 'pending',
        enum: ['pending', 'accepted', 'revoked'],
    })
    status: string;

    @ApiProperty({
        description: 'Tenant ID the user is invited to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Role names assigned to the invitation',
        example: ['USER', 'ADMIN'],
        type: [String],
    })
    roles: string[];
}