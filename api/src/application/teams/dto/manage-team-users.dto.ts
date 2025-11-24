import {
    IsArray,
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageTeamUsersDto {
    @ApiProperty({
        description: 'List of user IDs to add/remove from the team',
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    userIds: string[];
}