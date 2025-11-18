import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IOAuthService, OAUTH_SERVICE } from './interfaces/oauth.service.interface';
import { AzureDevOpsToken } from '../../../domain/entities/azure-devops-token.entity';
import { RequestWithTenant } from '../../middleware/request-with-tenant.interface';

@Injectable()
export class OAuthGuard implements CanActivate {
    private readonly logger = new Logger(OAuthGuard.name);

    constructor(
        @Inject(OAUTH_SERVICE)
        private readonly oauthService: IOAuthService,
        @InjectRepository(AzureDevOpsToken)
        private readonly tokenRepository: Repository<AzureDevOpsToken>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithTenant>();
        const userId = request.user?.id;

        if (!userId) {
            throw new UnauthorizedException('User authentication required');
        }

        try {
            // Check if user has Azure DevOps token
            const tokenEntity = await this.tokenRepository.findOne({
                where: { userId },
            });

            if (!tokenEntity) {
                throw new UnauthorizedException('Azure DevOps authorization required. Please connect your Azure DevOps account.');
            }

            // Check if token is expired
            const now = new Date();
            const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

            if (tokenEntity.expiresAt.getTime() - now.getTime() < bufferTime) {
                // Try to refresh the token
                try {
                    const refreshedTokens = await this.oauthService.refreshAccessToken(userId);
                    
                    // Update request with fresh token
                    request.azureDevOpsToken = refreshedTokens.accessToken;
                    
                    this.logger.debug('Token refreshed successfully for user', { userId });
                } catch (refreshError) {
                    this.logger.error('Failed to refresh expired token', refreshError);
                    throw new UnauthorizedException('Azure DevOps token expired. Please re-authorize your Azure DevOps account.');
                }
            } else {
                // Token is still valid, get it for the request
                const accessToken = await this.oauthService.getValidAccessToken(userId);
                if (accessToken) {
                    request.azureDevOpsToken = accessToken;
                } else {
                    throw new UnauthorizedException('Failed to retrieve Azure DevOps access token');
                }
            }

            return true;
        } catch (error) {
            this.logger.error('OAuth guard validation failed', { userId, error: error.message });
            
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            
            throw new UnauthorizedException('Azure DevOps authorization validation failed');
        }
    }
}