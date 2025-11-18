import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AnalyticsErrorInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AnalyticsErrorInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                this.logger.error('Analytics operation failed:', error);

                // Handle specific error types
                if (error instanceof HttpException) {
                    return throwError(() => error);
                }

                // Database connection errors
                if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                    return throwError(() => new HttpException(
                        'Analytics service temporarily unavailable. Please try again later.',
                        HttpStatus.SERVICE_UNAVAILABLE
                    ));
                }

                // Database query errors
                if (error.name === 'QueryFailedError') {
                    return throwError(() => new HttpException(
                        'Invalid analytics query parameters',
                        HttpStatus.BAD_REQUEST
                    ));
                }

                // Timeout errors
                if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
                    return throwError(() => new HttpException(
                        'Analytics query timed out. Try reducing the date range or applying filters.',
                        HttpStatus.REQUEST_TIMEOUT
                    ));
                }

                // Memory or resource exhaustion
                if (error.message?.includes('memory') || error.message?.includes('resource')) {
                    return throwError(() => new HttpException(
                        'Analytics query too complex. Please apply filters or reduce date range.',
                        HttpStatus.INSUFFICIENT_STORAGE
                    ));
                }

                // Default to internal server error
                return throwError(() => new HttpException(
                    'An unexpected error occurred while processing analytics data',
                    HttpStatus.INTERNAL_SERVER_ERROR
                ));
            })
        );
    }
}