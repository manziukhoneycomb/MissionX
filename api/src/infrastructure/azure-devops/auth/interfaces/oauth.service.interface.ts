export interface OAuthTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    scope: string;
}

export interface IOAuthService {
    getAuthorizationUrl(state?: string): string;
    exchangeCodeForToken(code: string, state?: string): Promise<OAuthTokenResponse>;
    refreshAccessToken(userId: string): Promise<OAuthTokenResponse>;
    revokeToken(userId: string): Promise<void>;
    storeTokens(userId: string, tenantId: string, tokens: OAuthTokenResponse): Promise<void>;
    getValidAccessToken(userId: string): Promise<string | null>;
}

export const OAUTH_SERVICE = Symbol('OAuthService');