/**
 * HTTP Status Codes Enum
 *
 * This enum provides a centralized definition of HTTP status codes
 * to be used throughout the application for consistent API responses.
 */
export enum HttpStatus {
    // 2xx Success
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,

    // 4xx Client Errors
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,

    // 5xx Server Errors
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
}
