import { Injectable, CallHandler, ExecutionContext, NestInterceptor, Inject, Logger } from '@nestjs/common';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, retry } from 'rxjs/operators';
import { IOAuthService, OAUTH_SERVICE } from './interfaces/oauth.service.interface';
import { RequestWithTenant } from '../../middleware/request-with-tenant.interface';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
    private readonly logger = new Logger(TokenInterceptor.name);

    constructor(@Inject(OAUTH_SERVICE) private readonly oauthService: IOAuthService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<RequestWithTenant>();
        const userId = request.user?.id;

        if (!userId) {
            return next.handle();
        }

        // Add token to the request if available
        return from(this.addTokenToRequest(request, userId)).pipe(
            switchMap(() => next.handle()),
            catchError((error) => {
                // If we get a 401, try to refresh token and retry once
                if (error.response?.status === 401 && this.shouldRetryWithTokenRefresh(error)) {
                    this.logger.debug('Received 401, attempting token refresh');
                    
                    return from(this.refreshTokenAndRetry(request, userId)).pipe(
                        switchMap(() => next.handle()),
                        retry(1),
                        catchError((retryError) => {
                            this.logger.error('Token refresh failed on retry', retryError);
                            return throwError(() => retryError);
                        }),
                    );
                }

                return throwError(() => error);
            }),
        );
    }

    private async addTokenToRequest(request: RequestWithTenant, userId: string): Promise<void> {
        try {
            const accessToken = await this.oauthService.getValidAccessToken(userId);
            
            if (accessToken) {
                // Add token to request for Azure DevOps API calls
                request.headers = request.headers || {};
                request.headers['authorization'] = `Bearer ${accessToken}`;
                request.azureDevOpsToken = accessToken;
            }
        } catch (error) {
            this.logger.warn(`Failed to get access token for user ${userId}`, error);
        }
    }

    private async refreshTokenAndRetry(request: RequestWithTenant, userId: string): Promise<void> {
        try {
            const refreshedTokens = await this.oauthService.refreshAccessToken(userId);
            
            // Update request headers with new token
            request.headers = request.headers || {};
            request.headers['authorization'] = `Bearer ${refreshedTokens.accessToken}`;
            request.azureDevOpsToken = refreshedTokens.accessToken;
            
            this.logger.debug('Token refreshed successfully');
        } catch (error) {
            this.logger.error('Failed to refresh token', error);
            throw error;
        }
    }

    private shouldRetryWithTokenRefresh(error: any): boolean {
        // Only retry if the error is specifically an authentication error
        // and not other types of 401 errors
        return error.response?.status === 401 && 
               (error.response?.data?.message?.includes('token') ||
                error.response?.data?.error?.includes('invalid_token') ||
                error.response?.statusText === 'Unauthorized');
    }
}