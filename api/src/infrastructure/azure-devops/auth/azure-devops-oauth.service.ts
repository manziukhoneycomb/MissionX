import {
    Injectable,
    Logger,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import {
    ISecretsService,
    SECRETS_SERVICE,
} from '../../../application/secrets/interfaces/secrets.service.interface';
import { Inject } from '@nestjs/common';
import { SecretKey } from '../../../domain/enums/secret-key.enum';
import { AzureDevOpsTokenDto, OAuthAuthorizationUrlDto, OAuthCallbackDto } from '../dto/oauth-token.dto';

interface AzureDevOpsOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string;
    authUrl: string;
    tokenUrl: string;
}

interface AzureDevOpsTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

@Injectable()
export class AzureDevOpsOAuthService {
    private readonly logger = new Logger(AzureDevOpsOAuthService.name);
    private readonly config: AzureDevOpsOAuthConfig;

    constructor(
        private readonly configService: ConfigService,
        @Inject(SECRETS_SERVICE)
        private readonly secretsService: ISecretsService,
    ) {
        this.config = {
            clientId: this.configService.get<string>('AZURE_DEVOPS_CLIENT_ID') || '',
            clientSecret: this.configService.get<string>('AZURE_DEVOPS_CLIENT_SECRET') || '',
            redirectUri: this.configService.get<string>('AZURE_DEVOPS_REDIRECT_URI') || 
                `${this.configService.get<string>('API_BASE_URL')}/auth/azure-devops/callback`,
            scope: 'vso.work vso.project',
            authUrl: 'https://app.vssps.visualstudio.com/oauth2/authorize',
            tokenUrl: 'https://app.vssps.visualstudio.com/oauth2/token',
        };
    }

    generateAuthorizationUrl(tenantId: string, organization: string, project?: string): OAuthAuthorizationUrlDto {
        const state = crypto.randomBytes(32).toString('hex');
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: 'code',
            redirect_uri: this.config.redirectUri,
            scope: this.config.scope,
            state: `${state}:${tenantId}:${organization}${project ? `:${project}` : ''}`,
        });

        const authorizationUrl = `${this.config.authUrl}?${params.toString()}`;

        return {
            authorizationUrl,
            state,
        };
    }

    async exchangeCodeForToken(callbackDto: OAuthCallbackDto, tenantId: string): Promise<AzureDevOpsTokenDto> {
        try {
            const { code, state, organization, project } = callbackDto;

            if (!this.validateState(state, tenantId, organization, project)) {
                throw new BadRequestException('Invalid OAuth state parameter');
            }

            const tokenResponse = await this.requestAccessToken(code);
            
            const tokenDto: AzureDevOpsTokenDto = {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                expiresIn: tokenResponse.expires_in,
                expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
                organization,
                project,
            };

            await this.storeTokensForTenant(tenantId, tokenDto);

            return tokenDto;
        } catch (error) {
            this.logger.error(`Failed to exchange OAuth code for token: ${error.message}`, error.stack);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to complete OAuth flow');
        }
    }

    async refreshToken(tenantId: string): Promise<AzureDevOpsTokenDto | null> {
        try {
            const storedToken = await this.getStoredTokensForTenant(tenantId);
            
            if (!storedToken || !storedToken.refreshToken) {
                return null;
            }

            const tokenResponse = await this.requestRefreshToken(storedToken.refreshToken);
            
            const tokenDto: AzureDevOpsTokenDto = {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token || storedToken.refreshToken,
                expiresIn: tokenResponse.expires_in,
                expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
                organization: storedToken.organization,
                project: storedToken.project,
            };

            await this.storeTokensForTenant(tenantId, tokenDto);

            return tokenDto;
        } catch (error) {
            this.logger.error(`Failed to refresh OAuth token: ${error.message}`, error.stack);
            return null;
        }
    }

    async getValidToken(tenantId: string): Promise<AzureDevOpsTokenDto | null> {
        const storedToken = await this.getStoredTokensForTenant(tenantId);
        
        if (!storedToken) {
            return null;
        }

        if (storedToken.expiresAt > new Date()) {
            return storedToken;
        }

        return await this.refreshToken(tenantId);
    }

    async revokeToken(tenantId: string): Promise<void> {
        try {
            const keyName = this.getTokenKeyName(tenantId);
            await this.secretsService.deleteSecret(keyName);
        } catch (error) {
            this.logger.error(`Failed to revoke OAuth token: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to revoke OAuth token');
        }
    }

    private validateState(state: string, tenantId: string, organization: string, project?: string): boolean {
        const expectedPrefix = `${tenantId}:${organization}${project ? `:${project}` : ''}`;
        const parts = state.split(':');
        
        if (parts.length < 3) {
            return false;
        }

        const actualSuffix = parts.slice(1).join(':');
        return actualSuffix === expectedPrefix;
    }

    private async requestAccessToken(code: string): Promise<AzureDevOpsTokenResponse> {
        const params = new URLSearchParams({
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: this.config.clientSecret,
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: code,
            redirect_uri: this.config.redirectUri,
        });

        const response = await axios.post(this.config.tokenUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    }

    private async requestRefreshToken(refreshToken: string): Promise<AzureDevOpsTokenResponse> {
        const params = new URLSearchParams({
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: this.config.clientSecret,
            grant_type: 'refresh_token',
            assertion: refreshToken,
            redirect_uri: this.config.redirectUri,
        });

        const response = await axios.post(this.config.tokenUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    }

    private async storeTokensForTenant(tenantId: string, token: AzureDevOpsTokenDto): Promise<void> {
        const keyName = this.getTokenKeyName(tenantId);
        const tokenData = JSON.stringify(token);
        
        await this.secretsService.setSecret(keyName, tokenData);
    }

    private async getStoredTokensForTenant(tenantId: string): Promise<AzureDevOpsTokenDto | null> {
        try {
            const keyName = this.getTokenKeyName(tenantId);
            const tokenData = await this.secretsService.getSecret(keyName);
            
            if (!tokenData) {
                return null;
            }

            const parsedToken = JSON.parse(tokenData);
            
            return {
                ...parsedToken,
                expiresAt: new Date(parsedToken.expiresAt),
            };
        } catch (error) {
            this.logger.warn(`Failed to get stored token: ${error.message}`);
            return null;
        }
    }

    private getTokenKeyName(tenantId: string): string {
        return `azure_devops_token_${tenantId}`;
    }
}