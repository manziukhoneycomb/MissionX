import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { TeamAccessGuard, TEAM_ACCESS_KEY } from '../guards/team-access.guard';

export function RequireTeamAccess() {
    return applyDecorators(SetMetadata(TEAM_ACCESS_KEY, true), UseGuards(TeamAccessGuard));
}
