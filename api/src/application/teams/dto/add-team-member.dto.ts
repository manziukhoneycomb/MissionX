import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddTeamMemberDto {
    @ApiProperty({
        description: 'ID of the user to add to the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    userId: string;
}
