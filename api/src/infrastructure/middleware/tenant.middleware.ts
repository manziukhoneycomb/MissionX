import { Injectable, NestMiddleware } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { RequestWithTenant } from './request-with-tenant.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly defaultTenantId: string | undefined;

    constructor(private readonly configService: ConfigService) {
        this.defaultTenantId = this.configService.get<string>('DEFAULT_TENANT_ID');
    }

    async use(req: RequestWithTenant, res: Response, next: NextFunction) {
        if (this.defaultTenantId) {
            req.tenantId = this.defaultTenantId;
        } else {
            const token: string | undefined = req.headers.authorization;

            if (token) {
                const claims = await clerkClient.verifyToken(token);

                req.tenantId = claims.tenantId as string | undefined;
            }
        }

        next();
    }
}
