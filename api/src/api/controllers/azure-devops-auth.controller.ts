import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    Query,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiQuery,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiProperty,
} from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { RoleName } from '../../domain/enums/role-name.enum';
import { AzureDevOpsOAuthService } from '../../infrastructure/azure-devops/auth/azure-devops-oauth.service';
import {
    AzureDevOpsTokenDto,
    OAuthAuthorizationUrlDto,
    OAuthCallbackDto,
} from '../../infrastructure/azure-devops/dto/oauth-token.dto';

class AzureDevOpsAuthRequestDto {
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

@ApiTags('Azure DevOps Authentication')
@ApiBearerAuth()
@Controller('auth/azure-devops')
@Authorize()
export class AzureDevOpsAuthController {
    constructor(
        private readonly azureDevOpsOAuthService: AzureDevOpsOAuthService,
    ) {}

    @Post('authorize')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get Azure DevOps authorization URL',
        description: 'Generates OAuth authorization URL for Azure DevOps integration',
    })
    @ApiBody({ type: AzureDevOpsAuthRequestDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Authorization URL generated successfully',
        type: OAuthAuthorizationUrlDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    @ApiBadRequestResponse({ description: 'Invalid request parameters' })
    getAuthorizationUrl(
        @Body() dto: AzureDevOpsAuthRequestDto,
        @Req() req: RequestWithTenant,
    ): OAuthAuthorizationUrlDto {
        const tenantId = req.tenantId;
        
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is required');
        }

        if (!dto.organization) {
            throw new BadRequestException('Azure DevOps organization name is required');
        }

        return this.azureDevOpsOAuthService.generateAuthorizationUrl(
            tenantId,
            dto.organization,
            dto.project,
        );
    }

    @Get('callback')
    @ApiOperation({
        summary: 'Azure DevOps OAuth callback',
        description: 'Handles OAuth callback from Azure DevOps and exchanges authorization code for access token',
    })
    @ApiQuery({
        name: 'code',
        description: 'OAuth authorization code from Azure DevOps',
        example: 'abc123def456',
    })
    @ApiQuery({
        name: 'state',
        description: 'OAuth state parameter for security verification',
        example: 'state123:tenant456:organization789',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'OAuth callback processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Invalid callback parameters' })
    async handleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
    ): Promise<{ success: boolean; message: string }> {
        if (!code || !state) {
            throw new BadRequestException('Authorization code and state are required');
        }

        try {
            const stateParts = state.split(':');
            if (stateParts.length < 3) {
                throw new BadRequestException('Invalid state parameter format');
            }

            const [, tenantId, organization, project] = stateParts;

            const callbackDto: OAuthCallbackDto = {
                code,
                state,
                organization,
                project,
            };

            await this.azureDevOpsOAuthService.exchangeCodeForToken(callbackDto, tenantId);

            return {
                success: true,
                message: 'Azure DevOps integration configured successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to complete OAuth flow: ${error.message}`,
            };
        }
    }

    @Get('status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get Azure DevOps integration status',
        description: 'Check if Azure DevOps integration is configured for the current tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Integration status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                isConfigured: { type: 'boolean' },
                organization: { type: 'string' },
                project: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async getIntegrationStatus(
        @Req() req: RequestWithTenant,
    ): Promise<{
        isConfigured: boolean;
        organization?: string;
        project?: string;
        expiresAt?: Date;
    }> {
        const tenantId = req.tenantId;
        
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is required');
        }

        const token = await this.azureDevOpsOAuthService.getValidToken(tenantId);

        if (!token) {
            return { isConfigured: false };
        }

        return {
            isConfigured: true,
            organization: token.organization,
            project: token.project,
            expiresAt: token.expiresAt,
        };
    }

    @Post('disconnect')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Disconnect Azure DevOps integration',
        description: 'Revokes Azure DevOps access tokens and disconnects the integration',
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Azure DevOps integration disconnected successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async disconnectIntegration(@Req() req: RequestWithTenant): Promise<void> {
        const tenantId = req.tenantId;
        
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is required');
        }

        await this.azureDevOpsOAuthService.revokeToken(tenantId);
    }

    @Post('refresh')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Refresh Azure DevOps access token',
        description: 'Manually refresh the Azure DevOps access token using the refresh token',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token refreshed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async refreshToken(
        @Req() req: RequestWithTenant,
    ): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
        const tenantId = req.tenantId;
        
        if (!tenantId) {
            throw new BadRequestException('Tenant ID is required');
        }

        const token = await this.azureDevOpsOAuthService.refreshToken(tenantId);

        if (!token) {
            return {
                success: false,
                message: 'Failed to refresh token or no refresh token available',
            };
        }

        return {
            success: true,
            message: 'Token refreshed successfully',
            expiresAt: token.expiresAt,
        };
    }
}