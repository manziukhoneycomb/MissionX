import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    EXPIRED = 'expired',
    REVOKED = 'revoked',
}

export class CreateUserInvitationDto {
    @ApiProperty({
        description: 'Email address of the user to invite',
        example: 'newuser@company.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'First name of the user to invite',
        example: 'John',
        required: false
    })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the user to invite',
        example: 'Doe',
        required: false
    })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({
        description: 'Array of role IDs to assign to the user',
        example: ['123e4567-e89b-12d3-a456-426614174001'],
        type: [String]
    })
    @IsArray()
    @IsUUID('4', { each: true })
    roleIds: string[];

    @ApiProperty({
        description: 'Optional message to include in the invitation',
        example: 'Welcome to our team!',
        required: false
    })
    @IsOptional()
    @IsString()
    message?: string;
}

export class UserInvitationDto {
    @ApiProperty({
        description: 'Unique identifier of the invitation',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Email address of the invited user',
        example: 'inviteduser@company.com'
    })
    email: string;

    @ApiProperty({
        description: 'First name of the invited user',
        example: 'Jane',
        required: false
    })
    firstName?: string;

    @ApiProperty({
        description: 'Last name of the invited user',
        example: 'Smith',
        required: false
    })
    lastName?: string;

    @ApiProperty({
        description: 'Status of the invitation',
        enum: InvitationStatus,
        example: InvitationStatus.PENDING
    })
    status: InvitationStatus;

    @ApiProperty({
        description: 'ID of the tenant that sent the invitation',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    tenantId: string;

    @ApiProperty({
        description: 'ID of the user who sent the invitation',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    invitedByUserId: string;

    @ApiProperty({
        description: 'Unique invitation token',
        example: 'abcd1234-ef56-7890-abcd-123456789012'
    })
    invitationToken: string;

    @ApiProperty({
        description: 'ID of the user who accepted the invitation',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    acceptedByUserId?: string;

    @ApiProperty({
        description: 'Date when the invitation was accepted',
        example: '2023-01-15T10:30:00Z',
        required: false
    })
    acceptedAt?: Date;

    @ApiProperty({
        description: 'Optional message included in the invitation',
        example: 'Welcome to our team!',
        required: false
    })
    message?: string;

    @ApiProperty({
        description: 'Date when the invitation expires',
        example: '2023-12-31T23:59:59Z'
    })
    expiresAt: Date;

    @ApiProperty({
        description: 'Date when the invitation was created',
        example: '2023-01-01T12:00:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the invitation was last updated',
        example: '2023-01-02T12:00:00Z'
    })
    updatedAt: Date;
}