import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleName } from 'src/domain/enums/role-name.enum';
import { RolesGuard } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are required to access a resource.
 * @param roles - An array of RoleName enums representing the allowed roles.
 */
export function Authorize(...roles: RoleName[]) {
    return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard));
}
