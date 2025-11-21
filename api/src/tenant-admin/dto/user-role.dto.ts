import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray } from 'class-validator';

export class AssignRoleDto {
    @ApiProperty({
        description: 'Array of role IDs to assign to the user',
        example: ['123e4567-e89b-12d3-a456-426614174001'],
        type: [String]
    })
    @IsArray()
    @IsUUID('4', { each: true })
    roleIds: string[];
}

export class RemoveRoleDto {
    @ApiProperty({
        description: 'Array of role IDs to remove from the user',
        example: ['123e4567-e89b-12d3-a456-426614174001'],
        type: [String]
    })
    @IsArray()
    @IsUUID('4', { each: true })
    roleIds: string[];
}