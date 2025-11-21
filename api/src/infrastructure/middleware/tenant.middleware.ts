import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { RequestWithTenant } from './request-with-tenant.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name);
    private readonly defaultTenantId: string | undefined;

    constructor(private readonly configService: ConfigService) {
        this.defaultTenantId = this.configService.get<string>('DEFAULT_TENANT_ID');
    }

    async use(req: RequestWithTenant, res: Response, next: NextFunction) {
        try {
            if (this.defaultTenantId) {
                req.tenantId = this.defaultTenantId;
                this.logger.debug(`Using default tenant ID: ${this.defaultTenantId}`);
            } else {
                const token: string | undefined = req.headers.authorization;

                if (token) {
                    const claims = await clerkClient.verifyToken(token);
                    req.tenantId = claims.tenantId as string | undefined;

                    if (req.tenantId) {
                        this.logger.debug(`Tenant context set from token: ${req.tenantId}`);
                    }
                }
            }

            if (req.tenantId) {
                await this.validateTenantAccess(req);
            }
        } catch (error) {
            this.logger.error(`Tenant middleware error: ${error}`);
        }

        next();
    }

    private async validateTenantAccess(req: RequestWithTenant): Promise<void> {
        this.logger.debug(`Validating access to tenant: ${req.tenantId}`);
    }
}
