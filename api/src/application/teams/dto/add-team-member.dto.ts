import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTeamMemberDto {
    @ApiProperty({
        description: 'ID of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    teamId: string;

    @ApiProperty({
        description: 'ID of the user to add to the team',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'ID of the team role to assign',
        example: '123e4567-e89b-12d3-a456-426614174002',
    })
    @IsNotEmpty()
    @IsUUID()
    teamRoleId: string;
}
