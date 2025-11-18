import { ApiProperty } from '@nestjs/swagger';

export class AzureDevOpsTokenDto {
    @ApiProperty({
        description: 'OAuth access token for Azure DevOps API',
        example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiI...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'OAuth refresh token for Azure DevOps API',
        example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiI...',
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Token expiration time in seconds from now',
        example: 3600,
    })
    expiresIn: number;

    @ApiProperty({
        description: 'Absolute expiration timestamp',
        example: '2023-01-01T13:00:00Z',
    })
    expiresAt: Date;

    @ApiProperty({
        description: 'Azure DevOps organization name',
        example: 'my-organization',
    })
    organization: string;

    @ApiProperty({
        description: 'Azure DevOps project name',
        example: 'my-project',
    })
    project?: string;
}

export class OAuthAuthorizationUrlDto {
    @ApiProperty({
        description: 'OAuth authorization URL for Azure DevOps',
        example: 'https://app.vssps.visualstudio.com/oauth2/authorize?client_id=...',
    })
    authorizationUrl: string;

    @ApiProperty({
        description: 'OAuth state parameter for security',
        example: 'abc123def456',
    })
    state: string;
}

export class OAuthCallbackDto {
    @ApiProperty({
        description: 'OAuth authorization code from Azure DevOps',
        example: 'def456ghi789',
    })
    code: string;

    @ApiProperty({
        description: 'OAuth state parameter for verification',
        example: 'abc123def456',
    })
    state: string;

    @ApiProperty({
        description: 'Azure DevOps organization name',
        example: 'my-organization',
    })
    organization: string;

    @ApiProperty({
        description: 'Azure DevOps project name',
        example: 'my-project',
        required: false,
    })
    project?: string;
}