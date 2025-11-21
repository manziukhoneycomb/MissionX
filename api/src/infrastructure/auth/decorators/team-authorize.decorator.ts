import { SetMetadata } from '@nestjs/common';
import { TeamRoleName } from '../../../domain/enums/team-role-name.enum';

export const TEAM_ROLES_KEY = 'team_roles';
export const TeamAuthorize = (...roles: TeamRoleName[]) => SetMetadata(TEAM_ROLES_KEY, roles);
