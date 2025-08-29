export interface ErrorInfo {
    message: string;
    stack?: string;
}

/**
 * Safely extracts message and stack trace from an unknown error object.
 * @param error The error object caught (typed as unknown).
 * @param defaultMessage The message to return if the error is not an Error instance or has no message.
 * @returns An object containing the error message and optional stack trace.
 */
export function extractErrorInfo(
    error: unknown,
    defaultMessage: string = 'An unknown error occurred',
): ErrorInfo {
    if (error instanceof Error) {
        return {
            message: error.message || defaultMessage,
            stack: error.stack,
        };
    }

    if (typeof error === 'string') {
        return { message: error };
    }

    return { message: defaultMessage };
}
