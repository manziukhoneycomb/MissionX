import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class InviteUserDto {
    @ApiProperty({
        description: 'Email address of the user to invite',
        example: 'user@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        description: 'Array of role IDs to assign to the invited user',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
    })
    @IsArray()
    @IsUUID('4', { each: true })
    roleIds!: string[];
}