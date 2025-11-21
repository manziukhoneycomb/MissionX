import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { TeamRoleName } from '../../../domain/enums/team-role-name.enum';
import { Authorize } from './authorize.decorator';
import { TeamAuthorize } from './team-authorize.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { TeamRolesGuard } from '../guards/team-roles.guard';

export interface HybridAuthOptions {
    globalRoles?: RoleName[];
    teamRoles?: TeamRoleName[];
    requireBoth?: boolean;
}

export function HybridAuthorize(options: HybridAuthOptions) {
    const decorators: (MethodDecorator | ClassDecorator)[] = [];

    if (options.globalRoles && options.globalRoles.length > 0) {
        decorators.push(Authorize(...options.globalRoles));
        decorators.push(UseGuards(RolesGuard));
    }

    if (options.teamRoles && options.teamRoles.length > 0) {
        decorators.push(TeamAuthorize(...options.teamRoles));
        decorators.push(UseGuards(TeamRolesGuard));
    }

    return applyDecorators(...decorators);
}
