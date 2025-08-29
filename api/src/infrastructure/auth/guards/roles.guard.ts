import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { ROLES_KEY } from '../decorators/authorize.decorator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';
import { extractErrorInfo } from '../../../domain/utils/error.utils';

interface RequestWithUserRoles extends Request {
    userRoles?: RoleName[];
}

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            const request: RequestWithUserRoles = context.switchToHttp().getRequest();
            const token: string | undefined = request.headers.authorization;

            if (!token) {
                throw new Error('Session token not found.');
            }

            const claims = await clerkClient.verifyToken(token);
            const userRoles = claims.roles as RoleName[] | undefined;

            if (!userRoles) {
                throw new ForbiddenException('User roles not found.');
            }

            request.userRoles = userRoles;

            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            const hasRequiredRole = requiredRoles.some((role) =>
                userRoles.some((userRole) => userRole === role),
            );

            if (!hasRequiredRole) {
                throw new ForbiddenException('Insufficient permissions');
            }
        } catch (error: unknown) {
            const { message } = extractErrorInfo(error, 'Unknown authentication error');
            this.logger.error(`Authentication error: ${message}`);

            return false;
        }

        return true;
    }
}
