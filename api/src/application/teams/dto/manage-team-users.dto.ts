import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageTeamUsersDto {
    @ApiProperty({
        description: 'List of user IDs to add or remove from the team',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
        minItems: 1,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('4', { each: true })
    userIds: string[];
}
