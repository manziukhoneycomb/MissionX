import { Injectable, Logger } from '@nestjs/common';
import { RoleName } from '../../domain/enums/role-name.enum';

export interface UserPermissionContext {
    userId: string;
    globalRoles: RoleName[];
    teamRoles: { teamId: string; roles: RoleName[] }[];
    tenantId?: string;
}

export interface EffectivePermissions {
    globalRoles: RoleName[];
    teamRoles: RoleName[];
    effectiveRoles: RoleName[];
    hasGlobalAccess: boolean;
    hasTeamAccess: boolean;
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
        teamId?: string,
    ): EffectivePermissions {
        const globalRoles = userContext.globalRoles || [];
        let teamRoles: RoleName[] = [];

        if (teamId) {
            const teamRoleEntry = userContext.teamRoles?.find((tr) => tr.teamId === teamId);
            teamRoles = teamRoleEntry?.roles || [];
        }

        const hasGlobalAccess = this.hasGlobalAdminAccess(globalRoles);
        const hasTeamAccess = teamRoles.length > 0 || hasGlobalAccess;

        const effectiveRoles = this.mergeRoles(globalRoles, teamRoles, hasGlobalAccess);

        return {
            globalRoles,
            teamRoles,
            effectiveRoles,
            hasGlobalAccess,
            hasTeamAccess,
        };
    }

    hasPermission(
        userContext: UserPermissionContext,
        requiredRoles: RoleName[],
        teamId?: string,
    ): boolean {
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const permissions = this.resolveEffectivePermissions(userContext, teamId);

        return requiredRoles.some((requiredRole) =>
            permissions.effectiveRoles.some((userRole) =>
                this.roleHasPermission(userRole, requiredRole),
            ),
        );
    }

    private hasGlobalAdminAccess(globalRoles: RoleName[]): boolean {
        return globalRoles.includes(RoleName.SUPER_ADMIN) || globalRoles.includes(RoleName.ADMIN);
    }

    private mergeRoles(
        globalRoles: RoleName[],
        teamRoles: RoleName[],
        hasGlobalAccess: boolean,
    ): RoleName[] {
        if (hasGlobalAccess) {
            return [...new Set([...globalRoles, ...teamRoles])];
        }

        const teamSpecificRoles = teamRoles.filter(
            (role) =>
                role === RoleName.TEAM_ADMIN ||
                role === RoleName.TEAM_MEMBER ||
                role === RoleName.TEAM_VIEWER,
        );

        const nonAdminGlobalRoles = globalRoles.filter(
            (role) => role !== RoleName.SUPER_ADMIN && role !== RoleName.ADMIN,
        );

        return [...new Set([...nonAdminGlobalRoles, ...teamSpecificRoles])];
    }

    private roleHasPermission(userRole: RoleName, requiredRole: RoleName): boolean {
        const userLevel = this.roleHierarchy[userRole] || 0;
        const requiredLevel = this.roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    canManageTeam(userContext: UserPermissionContext, teamId: string): boolean {
        const permissions = this.resolveEffectivePermissions(userContext, teamId);

        return permissions.hasGlobalAccess || permissions.teamRoles.includes(RoleName.TEAM_ADMIN);
    }

    canViewTeam(userContext: UserPermissionContext, teamId: string): boolean {
        const permissions = this.resolveEffectivePermissions(userContext, teamId);

        return permissions.hasGlobalAccess || permissions.hasTeamAccess;
    }

    extractUserRolesFromClaims(claims: any): UserPermissionContext {
        const globalRoles: RoleName[] = [];
        const teamRoles: { teamId: string; roles: RoleName[] }[] = [];

        if (claims.roles) {
            if (Array.isArray(claims.roles)) {
                globalRoles.push(
                    ...claims.roles.filter((role) => Object.values(RoleName).includes(role)),
                );
            }
        }

        if (claims.teamRoles) {
            for (const [teamId, roles] of Object.entries(claims.teamRoles)) {
                if (Array.isArray(roles)) {
                    const validRoles = roles.filter((role) =>
                        Object.values(RoleName).includes(role),
                    ) as RoleName[];

                    if (validRoles.length > 0) {
                        teamRoles.push({ teamId, roles: validRoles });
                    }
                }
            }
        }

        return {
            userId: claims.sub || claims.userId,
            globalRoles,
            teamRoles,
            tenantId: claims.tenantId,
        };
    }
}
