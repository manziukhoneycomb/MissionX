import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';

export class AnalyticsErrorUtils {
    private static readonly logger = new Logger(AnalyticsErrorUtils.name);

    static handleQueryError(error: any, operation: string): never {
        this.logger.error(`Analytics query error in ${operation}:`, error);
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new InternalServerErrorException('Database connection error');
        }
        
        if (error.message?.includes('invalid date') || error.message?.includes('date format')) {
            throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD format.');
        }
        
        if (error.message?.includes('timeout') || error.code === 'ECONNRESET') {
            throw new InternalServerErrorException('Query timeout. Please try again with a smaller date range.');
        }
        
        if (error.message?.includes('permission') || error.message?.includes('access denied')) {
            throw new BadRequestException('Insufficient permissions to access analytics data');
        }
        
        throw new InternalServerErrorException(`Failed to retrieve analytics data for ${operation}`);
    }

    static validateDateRange(startDate?: string, endDate?: string): void {
        if (!startDate && !endDate) {
            return;
        }

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                throw new BadRequestException('Invalid start date format. Use YYYY-MM-DD format.');
            }
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                throw new BadRequestException('Invalid end date format. Use YYYY-MM-DD format.');
            }
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start > end) {
                throw new BadRequestException('Start date cannot be after end date.');
            }

            const now = new Date();
            if (start > now) {
                throw new BadRequestException('Start date cannot be in the future.');
            }

            // Check if date range is too large (more than 5 years)
            const maxRange = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
            if (end.getTime() - start.getTime() > maxRange) {
                throw new BadRequestException('Date range cannot exceed 5 years.');
            }
        }
    }

    static sanitizeQueryParams(params: any): any {
        const sanitized = { ...params };
        
        // Remove null/undefined values
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] == null || sanitized[key] === '') {
                delete sanitized[key];
            }
        });
        
        // Validate and format dates
        if (sanitized.startDate) {
            sanitized.startDate = sanitized.startDate.trim();
        }
        if (sanitized.endDate) {
            sanitized.endDate = sanitized.endDate.trim();
        }
        
        // Validate tenant ID format if provided
        if (sanitized.tenantId) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(sanitized.tenantId)) {
                throw new BadRequestException('Invalid tenant ID format.');
            }
        }
        
        return sanitized;
    }

    static logPerformance(operation: string, startTime: number, recordCount: number = 0): void {
        const duration = Date.now() - startTime;
        const level = duration > 5000 ? 'warn' : duration > 2000 ? 'log' : 'debug';
        
        this.logger[level](`Analytics ${operation} completed in ${duration}ms (${recordCount} records processed)`);
    }
}