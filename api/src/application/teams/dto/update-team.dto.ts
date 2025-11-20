import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
    @ApiPropertyOptional({
        description: 'Whether the team is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
