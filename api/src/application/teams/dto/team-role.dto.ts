import { ApiProperty } from '@nestjs/swagger';
import { TeamRoleName } from '../../../domain/enums/team-role-name.enum';

export class TeamRoleDto {
    @ApiProperty({
        description: 'Unique identifier of the team role',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the team role',
        enum: TeamRoleName,
        example: TeamRoleName.TEAM_MEMBER,
    })
    name: TeamRoleName;

    @ApiProperty({
        description: 'Description of the team role',
        example: 'Standard team member with access to team resources',
        required: false,
    })
    description?: string;
}
