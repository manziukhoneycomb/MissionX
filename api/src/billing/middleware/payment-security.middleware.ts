import { Injectable, NestMiddleware, Logger, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { RoleName } from '../../domain/enums/role-name.enum';

@Injectable()
export class PaymentSecurityMiddleware implements NestMiddleware {
    private readonly logger = new Logger(PaymentSecurityMiddleware.name);

    use(req: RequestWithTenant, res: Response, next: NextFunction): void {
        this.logger.debug(`Payment security check for ${req.method} ${req.path}`);

        // Ensure user has admin role for billing operations
        if (!req.userRoles || !req.userRoles.includes(RoleName.ADMIN) && !req.userRoles.includes(RoleName.SUPER_ADMIN)) {
            this.logger.warn(`Unauthorized billing access attempt by user ${req.userId} without admin role`);
            throw new ForbiddenException('Billing operations require admin privileges');
        }

        // Ensure tenant context exists (except for super admin operations)
        if (!req.userRoles.includes(RoleName.SUPER_ADMIN) && !req.tenantId) {
            this.logger.warn(`Billing access attempt by user ${req.userId} without tenant context`);
            throw new ForbiddenException('Billing operations require tenant context');
        }

        // Log billing operation for audit trail
        this.logger.log(`Billing operation authorized: ${req.method} ${req.path} by user ${req.userId} for tenant ${req.tenantId}`);

        // Additional security checks for sensitive operations
        this.performAdditionalSecurityChecks(req);

        next();
    }

    private performAdditionalSecurityChecks(req: RequestWithTenant): void {
        // Check for suspicious patterns in request
        if (this.containsSuspiciousPatterns(req)) {
            this.logger.error(`Suspicious billing request detected from user ${req.userId}: ${req.method} ${req.path}`);
            throw new ForbiddenException('Request contains suspicious patterns');
        }

        // Rate limiting checks (in a real implementation, you'd use a proper rate limiter)
        this.performRateLimitingCheck(req);

        // Validate request size for webhooks and payment data
        this.validateRequestSize(req);
    }

    private containsSuspiciousPatterns(req: RequestWithTenant): boolean {
        const suspiciousPatterns = [
            // Common injection patterns
            /(<script|javascript:|data:)/i,
            // SQL injection patterns
            /(union|select|drop|delete|insert|update)[\s]+/i,
            // Path traversal
            /(\.\.[\/\\])+/,
            // Command injection
            /(;|\||\&|\$\(|\`)/,
        ];

        const checkString = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
        
        return suspiciousPatterns.some(pattern => pattern.test(checkString));
    }

    private performRateLimitingCheck(req: RequestWithTenant): void {
        // In a production environment, you would implement proper rate limiting
        // using Redis or another storage mechanism
        // This is a simplified example
        
        const sensitiveEndpoints = [
            '/billing/setup',
            '/subscriptions',
            '/payment-methods',
        ];

        const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => 
            req.path.includes(endpoint)
        );

        if (isSensitiveEndpoint) {
            // In a real implementation, check against a rate limit store
            this.logger.debug(`Rate limiting check for sensitive endpoint: ${req.path}`);
        }
    }

    private validateRequestSize(req: RequestWithTenant): void {
        // Limit request body size for billing operations
        const maxBodySize = 10 * 1024; // 10KB
        
        if (req.body) {
            const bodySize = JSON.stringify(req.body).length;
            if (bodySize > maxBodySize) {
                this.logger.warn(`Oversized billing request from user ${req.userId}: ${bodySize} bytes`);
                throw new ForbiddenException('Request body too large');
            }
        }
    }
}