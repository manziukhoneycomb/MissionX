import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IOAuthService, OAuthTokenResponse } from './interfaces/oauth.service.interface';
import { AzureDevOpsOAuthConfig, getAzureDevOpsOAuthConfig } from './oauth.config';
import { AzureDevOpsToken } from '../../../domain/entities/azure-devops-token.entity';
import { ISecretService } from '../../../application/secrets/interfaces/secrets.service.interface';
import { SECRET_SERVICE } from '../../../application/secrets/interfaces/secrets.service.interface';
import { SecretKey } from '../../../domain/enums/secret-key.enum';

@Injectable()
export class OAuthService implements IOAuthService {
    private readonly logger = new Logger(OAuthService.name);
    private readonly config: AzureDevOpsOAuthConfig;

    constructor(
        @InjectRepository(AzureDevOpsToken)
        private readonly tokenRepository: Repository<AzureDevOpsToken>,
        @Inject(SECRET_SERVICE)
        private readonly secretService: ISecretService,
    ) {
        this.config = getAzureDevOpsOAuthConfig();
    }

    getAuthorizationUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: 'Assertion',
            state: state || '',
            scope: this.config.scopes.join(' '),
            redirect_uri: this.config.redirectUri,
        });

        return `${this.config.authorizationUrl}?${params.toString()}`;
    }

    async exchangeCodeForToken(code: string, state?: string): Promise<OAuthTokenResponse> {
        const params = new URLSearchParams({
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: this.config.clientSecret,
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: code,
            redirect_uri: this.config.redirectUri,
        });

        try {
            const response = await fetch(this.config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Token exchange failed: ${response.status} ${errorText}`);
                throw new UnauthorizedException('Failed to exchange authorization code for token');
            }

            const data = await response.json();

            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                scope: data.scope,
            };
        } catch (error) {
            this.logger.error('Error during token exchange', error);
            throw new UnauthorizedException('Failed to exchange authorization code for token');
        }
    }

    async refreshAccessToken(userId: string): Promise<OAuthTokenResponse> {
        const tokenEntity = await this.tokenRepository.findOne({
            where: { userId },
        });

        if (!tokenEntity) {
            throw new UnauthorizedException('No Azure DevOps token found for user');
        }

        const refreshToken = await this.decryptToken(tokenEntity.refreshToken, tokenEntity.tenantId);

        const params = new URLSearchParams({
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: this.config.clientSecret,
            grant_type: 'refresh_token',
            assertion: refreshToken,
            redirect_uri: this.config.redirectUri,
        });

        try {
            const response = await fetch(this.config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Token refresh failed: ${response.status} ${errorText}`);
                
                // If refresh fails, remove the invalid token
                await this.tokenRepository.remove(tokenEntity);
                throw new UnauthorizedException('Failed to refresh access token');
            }

            const data = await response.json();

            const tokenResponse: OAuthTokenResponse = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token || refreshToken,
                expiresIn: data.expires_in,
                scope: data.scope,
            };

            // Update stored tokens
            await this.storeTokens(userId, tokenEntity.tenantId, tokenResponse);

            return tokenResponse;
        } catch (error) {
            this.logger.error('Error during token refresh', error);
            throw new UnauthorizedException('Failed to refresh access token');
        }
    }

    async revokeToken(userId: string): Promise<void> {
        const tokenEntity = await this.tokenRepository.findOne({
            where: { userId },
        });

        if (!tokenEntity) {
            this.logger.warn(`No token found for user ${userId} to revoke`);
            return;
        }

        const accessToken = await this.decryptToken(tokenEntity.accessToken, tokenEntity.tenantId);

        try {
            const params = new URLSearchParams({
                token: accessToken,
                token_type_hint: 'access_token',
            });

            const response = await fetch(this.config.revokeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: params.toString(),
            });

            if (!response.ok) {
                this.logger.warn(`Token revocation failed: ${response.status}`);
            }
        } catch (error) {
            this.logger.error('Error during token revocation', error);
        } finally {
            // Remove token from database regardless of revocation success
            await this.tokenRepository.remove(tokenEntity);
        }
    }

    async storeTokens(userId: string, tenantId: string, tokens: OAuthTokenResponse): Promise<void> {
        const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

        const encryptedAccessToken = await this.encryptToken(tokens.accessToken, tenantId);
        const encryptedRefreshToken = await this.encryptToken(tokens.refreshToken, tenantId);

        const existingToken = await this.tokenRepository.findOne({
            where: { userId },
        });

        if (existingToken) {
            existingToken.accessToken = encryptedAccessToken;
            existingToken.refreshToken = encryptedRefreshToken;
            existingToken.expiresAt = expiresAt;
            existingToken.scope = tokens.scope;
            existingToken.updatedAt = new Date();

            await this.tokenRepository.save(existingToken);
        } else {
            const tokenEntity = this.tokenRepository.create({
                userId,
                tenantId,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt,
                scope: tokens.scope,
            });

            await this.tokenRepository.save(tokenEntity);
        }
    }

    async getValidAccessToken(userId: string): Promise<string | null> {
        const tokenEntity = await this.tokenRepository.findOne({
            where: { userId },
        });

        if (!tokenEntity) {
            return null;
        }

        // Check if token is expired (with 5 minute buffer)
        const now = new Date();
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (tokenEntity.expiresAt.getTime() - now.getTime() < bufferTime) {
            // Token is expired or will expire soon, try to refresh
            try {
                const refreshedTokens = await this.refreshAccessToken(userId);
                return refreshedTokens.accessToken;
            } catch (error) {
                this.logger.error('Failed to refresh expired token', error);
                return null;
            }
        }

        return await this.decryptToken(tokenEntity.accessToken, tokenEntity.tenantId);
    }

    private async encryptToken(token: string, tenantId: string): Promise<string> {
        // Store the token using the secrets service for encryption
        const secretKey = `azure-devops-token-${Date.now()}-${Math.random()}` as SecretKey;
        await this.secretService.setSecret(tenantId, { key: secretKey, value: token });
        return secretKey;
    }

    private async decryptToken(encryptedToken: string, tenantId: string): Promise<string> {
        // Retrieve the token using the secrets service for decryption
        const secret = await this.secretService.getSecret(tenantId, encryptedToken as SecretKey);
        if (!secret.value) {
            throw new UnauthorizedException('Failed to decrypt token');
        }
        return secret.value;
    }
}