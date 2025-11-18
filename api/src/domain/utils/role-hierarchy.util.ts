import { RoleName } from '../enums/role-name.enum';
import { TeamPermission } from '../enums/team-permission.enum';

export class RoleHierarchyUtil {
    private static readonly ROLE_HIERARCHY = {
        [RoleName.SUPER_ADMIN]: 100,
        [RoleName.ADMIN]: 90,
        [RoleName.TEAM_OWNER]: 80,
        [RoleName.TEAM_ADMIN]: 70,
        [RoleName.TEAM_MEMBER]: 60,
        [RoleName.USER]: 50,
    };

    private static readonly TEAM_ROLE_PERMISSIONS = {
        [RoleName.TEAM_OWNER]: [
            TeamPermission.READ_TEAM,
            TeamPermission.UPDATE_TEAM,
            TeamPermission.DELETE_TEAM,
            TeamPermission.MANAGE_MEMBERS,
            TeamPermission.MANAGE_ROLES,
            TeamPermission.MANAGE_SETTINGS,
            TeamPermission.VIEW_MEMBERS,
            TeamPermission.INVITE_MEMBERS,
            TeamPermission.REMOVE_MEMBERS,
        ],
        [RoleName.TEAM_ADMIN]: [
            TeamPermission.READ_TEAM,
            TeamPermission.UPDATE_TEAM,
            TeamPermission.MANAGE_MEMBERS,
            TeamPermission.MANAGE_SETTINGS,
            TeamPermission.VIEW_MEMBERS,
            TeamPermission.INVITE_MEMBERS,
            TeamPermission.REMOVE_MEMBERS,
        ],
        [RoleName.TEAM_MEMBER]: [
            TeamPermission.READ_TEAM,
            TeamPermission.VIEW_MEMBERS,
        ],
    };

    static isGlobalRole(role: RoleName): boolean {
        return [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.USER].includes(role);
    }

    static isTeamRole(role: RoleName): boolean {
        return [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER].includes(role);
    }

    static hasHigherPrecedence(role1: RoleName, role2: RoleName): boolean {
        return this.ROLE_HIERARCHY[role1] > this.ROLE_HIERARCHY[role2];
    }

    static getTeamPermissions(role: RoleName): TeamPermission[] {
        return this.TEAM_ROLE_PERMISSIONS[role] || [];
    }

    static hasTeamPermission(role: RoleName, permission: TeamPermission): boolean {
        if (this.isGlobalRole(role) && [RoleName.SUPER_ADMIN, RoleName.ADMIN].includes(role)) {
            return true;
        }
        return this.getTeamPermissions(role).includes(permission);
    }

    static canBypassTeamRestrictions(roles: RoleName[]): boolean {
        return roles.some(role => [RoleName.SUPER_ADMIN, RoleName.ADMIN].includes(role));
    }
}