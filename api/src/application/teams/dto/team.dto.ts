import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

export class TeamDto {
    @ApiProperty({
        description: 'Unique identifier of the team',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the team',
        example: 'Sales Team',
    })
    name: string;

    @ApiProperty({
        description: 'Description of the team',
        example: 'Responsible for all sales activities.',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Users who are members of this team',
        type: [UserDto],
    })
    users: UserDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
