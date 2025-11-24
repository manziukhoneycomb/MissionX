import { IsArray, ArrayNotEmpty, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageTeamUsersDto {
    @ApiProperty({
        description: 'List of user IDs to be assigned to the team',
        example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    userIds: string[];
}