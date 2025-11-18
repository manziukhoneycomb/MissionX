export interface AzureDevOpsOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    authorizationUrl: string;
    tokenUrl: string;
    revokeUrl: string;
}

export const getAzureDevOpsOAuthConfig = (): AzureDevOpsOAuthConfig => {
    const clientId = process.env.AZURE_DEVOPS_CLIENT_ID;
    const clientSecret = process.env.AZURE_DEVOPS_CLIENT_SECRET;
    const redirectUri = process.env.AZURE_DEVOPS_REDIRECT_URI;

    if (!clientId) {
        throw new Error('AZURE_DEVOPS_CLIENT_ID environment variable is required');
    }

    if (!clientSecret) {
        throw new Error('AZURE_DEVOPS_CLIENT_SECRET environment variable is required');
    }

    if (!redirectUri) {
        throw new Error('AZURE_DEVOPS_REDIRECT_URI environment variable is required');
    }

    return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: ['vso.work_write', 'vso.project'],
        authorizationUrl: 'https://app.vssps.visualstudio.com/oauth2/authorize',
        tokenUrl: 'https://app.vssps.visualstudio.com/oauth2/token',
        revokeUrl: 'https://app.vssps.visualstudio.com/oauth2/token/revoke',
    };
};