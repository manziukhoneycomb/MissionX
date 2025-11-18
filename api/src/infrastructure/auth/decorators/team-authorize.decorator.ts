import { SetMetadata } from '@nestjs/common';
import { TeamRoleName } from '../../../domain/enums/team-role-name.enum';

export const TEAM_ROLES_KEY = 'teamRoles';
export const TeamAuthorize = (...teamRoles: TeamRoleName[]) => SetMetadata(TEAM_ROLES_KEY, teamRoles);