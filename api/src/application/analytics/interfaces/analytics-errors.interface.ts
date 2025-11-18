export enum AnalyticsErrorCode {
    INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
    CACHE_ERROR = 'CACHE_ERROR',
    DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
    INVALID_PARAMETERS = 'INVALID_PARAMETERS',
    TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
    NO_DATA_AVAILABLE = 'NO_DATA_AVAILABLE'
}

export interface AnalyticsError {
    code: AnalyticsErrorCode;
    message: string;
    details?: any;
    timestamp: Date;
}

export class AnalyticsException extends Error {
    public readonly code: AnalyticsErrorCode;
    public readonly details?: any;
    public readonly timestamp: Date;

    constructor(code: AnalyticsErrorCode, message: string, details?: any) {
        super(message);
        this.code = code;
        this.details = details;
        this.timestamp = new Date();
        this.name = 'AnalyticsException';
    }
}