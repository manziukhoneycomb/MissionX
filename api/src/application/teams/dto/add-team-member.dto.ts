import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTeamMemberDto {
    @ApiProperty({
        description: 'ID of the user to add to the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsString()
    readonly userId: string;

    @ApiProperty({
        description: 'ID of the role to assign to the user in this team',
        example: '456e7890-a12b-34c5-d678-901234567890',
    })
    @IsNotEmpty()
    @IsString()
    readonly roleId: string;
}
