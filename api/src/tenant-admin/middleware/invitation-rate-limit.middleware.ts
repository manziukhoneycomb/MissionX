import {
    Injectable,
    NestMiddleware,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

@Injectable()
export class InvitationRateLimitMiddleware implements NestMiddleware {
    private readonly logger = new Logger(InvitationRateLimitMiddleware.name);
    private readonly rateLimitStore = new Map<string, RateLimitEntry>();
    private readonly maxInvitations = 10; // Max invitations per hour per tenant
    private readonly windowMs = 60 * 60 * 1000; // 1 hour in milliseconds

    use(req: RequestWithTenant, res: Response, next: NextFunction): void {
        // Only apply rate limiting to POST requests (creating invitations)
        if (req.method !== 'POST') {
            return next();
        }

        const tenantId = req.tenantId;

        if (!tenantId) {
            this.logger.warn('Rate limit middleware: No tenant ID found in request');
            return next();
        }

        const key = `invitation_rate_limit:${tenantId}`;
        const now = Date.now();

        // Get or create rate limit entry for this tenant
        let entry = this.rateLimitStore.get(key);

        if (!entry || now >= entry.resetTime) {
            // Create new entry or reset expired entry
            entry = {
                count: 0,
                resetTime: now + this.windowMs,
            };
            this.rateLimitStore.set(key, entry);
        }

        // Check if rate limit is exceeded
        if (entry.count >= this.maxInvitations) {
            const remainingTime = Math.ceil((entry.resetTime - now) / 1000 / 60); // minutes
            
            this.logger.warn(
                `Rate limit exceeded for tenant ${tenantId}. Count: ${entry.count}, Reset in: ${remainingTime} minutes`
            );

            // Set rate limit headers
            res.set({
                'X-RateLimit-Limit': this.maxInvitations.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
                'Retry-After': remainingTime.toString(),
            });

            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    error: 'Too Many Requests',
                    message: `Too many invitation requests. You can send up to ${this.maxInvitations} invitations per hour. Please try again in ${remainingTime} minutes.`,
                    retryAfter: remainingTime,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        // Increment count
        entry.count++;
        this.rateLimitStore.set(key, entry);

        const remaining = Math.max(0, this.maxInvitations - entry.count);

        // Set rate limit headers
        res.set({
            'X-RateLimit-Limit': this.maxInvitations.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
        });

        this.logger.debug(
            `Rate limit check passed for tenant ${tenantId}. Count: ${entry.count}/${this.maxInvitations}, Remaining: ${remaining}`
        );

        // Periodically clean up expired entries
        this.cleanupExpiredEntries();

        next();
    }

    private cleanupExpiredEntries(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, entry] of this.rateLimitStore.entries()) {
            if (now >= entry.resetTime) {
                this.rateLimitStore.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
        }
    }

    // Method to manually reset rate limit for a tenant (useful for testing or admin override)
    resetRateLimitForTenant(tenantId: string): void {
        const key = `invitation_rate_limit:${tenantId}`;
        this.rateLimitStore.delete(key);
        this.logger.log(`Rate limit reset for tenant ${tenantId}`);
    }

    // Method to get current rate limit status for a tenant
    getRateLimitStatus(tenantId: string): { count: number; limit: number; resetTime: Date } | null {
        const key = `invitation_rate_limit:${tenantId}`;
        const entry = this.rateLimitStore.get(key);

        if (!entry) {
            return null;
        }

        return {
            count: entry.count,
            limit: this.maxInvitations,
            resetTime: new Date(entry.resetTime),
        };
    }
}