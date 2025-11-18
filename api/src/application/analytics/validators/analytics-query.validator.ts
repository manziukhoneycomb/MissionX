import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AnalyticsQueryValidator {
    
    validateDateRange(startDate?: string, endDate?: string): void {
        if (startDate) {
            this.validateDateFormat(startDate, 'startDate');
        }
        
        if (endDate) {
            this.validateDateFormat(endDate, 'endDate');
        }
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start > end) {
                throw new BadRequestException('Start date must be before end date');
            }
            
            // Prevent excessively large date ranges (more than 5 years)
            const maxRange = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
            if ((end.getTime() - start.getTime()) > maxRange) {
                throw new BadRequestException('Date range cannot exceed 5 years');
            }
        }
    }
    
    private validateDateFormat(date: string, fieldName: string): void {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        
        if (!dateRegex.test(date)) {
            throw new BadRequestException(`${fieldName} must be in YYYY-MM-DD format`);
        }
        
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            throw new BadRequestException(`${fieldName} is not a valid date`);
        }
        
        // Check if date is not in the future
        const today = new Date();
        if (parsedDate > today) {
            throw new BadRequestException(`${fieldName} cannot be in the future`);
        }
        
        // Check if date is not too far in the past (more than 10 years)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 10);
        if (parsedDate < minDate) {
            throw new BadRequestException(`${fieldName} cannot be more than 10 years ago`);
        }
    }
    
    validateLimit(limit?: number): void {
        if (limit !== undefined) {
            if (!Number.isInteger(limit) || limit < 1) {
                throw new BadRequestException('Limit must be a positive integer');
            }
            
            if (limit > 1000) {
                throw new BadRequestException('Limit cannot exceed 1000');
            }
        }
    }
    
    validateTenantIds(tenantIds: string[]): void {
        if (!tenantIds || tenantIds.length === 0) {
            throw new BadRequestException('No accessible tenants found');
        }
        
        if (tenantIds.length > 100) {
            throw new BadRequestException('Cannot query more than 100 tenants at once');
        }
        
        // Validate UUID format for tenant IDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        for (const tenantId of tenantIds) {
            if (!uuidRegex.test(tenantId)) {
                throw new BadRequestException(`Invalid tenant ID format: ${tenantId}`);
            }
        }
    }
    
    validatePeriod(period?: string): void {
        if (period !== undefined) {
            const validPeriods = ['daily', 'weekly', 'monthly', 'quarterly'];
            if (!validPeriods.includes(period)) {
                throw new BadRequestException(`Period must be one of: ${validPeriods.join(', ')}`);
            }
        }
    }
    
    validateSortBy(sortBy?: string): void {
        if (sortBy !== undefined) {
            const validSortOptions = ['revenue', 'invoiceCount', 'paymentTimeliness'];
            if (!validSortOptions.includes(sortBy)) {
                throw new BadRequestException(`SortBy must be one of: ${validSortOptions.join(', ')}`);
            }
        }
    }
}