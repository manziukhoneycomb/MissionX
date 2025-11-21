import { Injectable, Logger } from '@nestjs/common';
import { RoleName } from '../../domain/enums/role-name.enum';

export interface UserPermissionContext {
    globalRoles: RoleName[];
    teamRoles: { [teamId: string]: RoleName[] };
}

export interface PermissionRequest {
    requiredRoles: RoleName[];
    teamId?: string;
}

@Injectable()
export class PermissionResolutionService {
    private readonly logger = new Logger(PermissionResolutionService.name);

    private readonly roleHierarchy: Record<RoleName, number> = {
        [RoleName.SUPER_ADMIN]: 100,
        [RoleName.ADMIN]: 80,
        [RoleName.TEAM_ADMIN]: 60,
        [RoleName.USER]: 40,
        [RoleName.TEAM_MEMBER]: 30,
        [RoleName.TEAM_VIEWER]: 20,
    };

    resolveEffectivePermissions(
        userContext: UserPermissionContext,
        permissionRequest: PermissionRequest,
    ): boolean {
        const { requiredRoles, teamId } = permissionRequest;
        const { globalRoles, teamRoles } = userContext;

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        let effectiveRoles: RoleName[] = [...globalRoles];

        if (teamId && teamRoles[teamId]) {
            effectiveRoles = [...effectiveRoles, ...teamRoles[teamId]];
        }

        const hasGlobalSuperAdmin = globalRoles.includes(RoleName.SUPER_ADMIN);
        if (hasGlobalSuperAdmin) {
            return true;
        }

        const hasRequiredRole = requiredRoles.some((requiredRole) =>
            effectiveRoles.some((userRole) => this.hasPermission(userRole, requiredRole)),
        );

        this.logger.debug(
            `Permission check: Required roles: ${requiredRoles.join(', ')}, ` +
                `User roles: ${effectiveRoles.join(', ')}, ` +
                `Team: ${teamId || 'none'}, ` +
                `Result: ${hasRequiredRole}`,
        );

        return hasRequiredRole;
    }

    private hasPermission(userRole: RoleName, requiredRole: RoleName): boolean {
        const userLevel = this.roleHierarchy[userRole] || 0;
        const requiredLevel = this.roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    parseUserRoles(clerkClaims: any): UserPermissionContext {
        const globalRoles: RoleName[] = [];
        const teamRoles: { [teamId: string]: RoleName[] } = {};

        if (clerkClaims.roles && Array.isArray(clerkClaims.roles)) {
            for (const role of clerkClaims.roles) {
                if (Object.values(RoleName).includes(role as RoleName)) {
                    globalRoles.push(role as RoleName);
                }
            }
        }

        if (clerkClaims.teamRoles && typeof clerkClaims.teamRoles === 'object') {
            for (const [teamId, roles] of Object.entries(clerkClaims.teamRoles)) {
                if (Array.isArray(roles)) {
                    teamRoles[teamId] = roles.filter((role) =>
                        Object.values(RoleName).includes(role as RoleName),
                    ) as RoleName[];
                }
            }
        }

        return { globalRoles, teamRoles };
    }

    getTeamAdministrativeRoles(): RoleName[] {
        return [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.TEAM_ADMIN];
    }

    getTeamMembershipRoles(): RoleName[] {
        return [RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER, RoleName.TEAM_VIEWER];
    }
}
