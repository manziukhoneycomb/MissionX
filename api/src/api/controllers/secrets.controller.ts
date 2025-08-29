import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    ParseEnumPipe,
    Inject,
} from '@nestjs/common';

import { SecretKey } from '../../domain/enums/secret-key.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { SecretDto } from '../../application/secrets/dto/secret.dto';
import {
    ISecretService,
    SECRET_SERVICE,
} from '../../application/secrets/interfaces/secrets.service.interface';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiBody,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Secrets')
@ApiBearerAuth()
@Controller('secrets')
@Authorize(RoleName.ADMIN)
export class SecretsController {
    constructor(@Inject(SECRET_SERVICE) private readonly secretService: ISecretService) {}

    @Get()
    @ApiOperation({
        summary: 'Get all secrets',
        description: 'Retrieves all secrets for the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of secrets retrieved successfully',
        type: [SecretDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getAllSecrets(@Req() request: RequestWithTenant): Promise<SecretDto[]> {
        const tenantId = request.tenantId!;

        return this.secretService.getAllSecrets(tenantId);
    }

    @Get(':key')
    @ApiOperation({
        summary: 'Get secret by key',
        description: 'Retrieves a specific secret by key',
    })
    @ApiParam({ name: 'key', description: 'Secret key', enum: SecretKey })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Secret retrieved successfully',
        type: SecretDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async getSecret(
        @Param('key', new ParseEnumPipe(SecretKey)) key: SecretKey,
        @Req() request: RequestWithTenant,
    ): Promise<SecretDto> {
        const tenantId = request.tenantId!;

        return this.secretService.getSecret(tenantId, key);
    }

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Set secret', description: 'Sets a secret value for the tenant' })
    @ApiBody({ type: SecretDto })
    @ApiNoContentResponse({ description: 'Secret set successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role' })
    async setSecret(
        @Body() secretDto: SecretDto,
        @Req() request: RequestWithTenant,
    ): Promise<void> {
        const tenantId = request.tenantId!;

        await this.secretService.setSecret(tenantId, secretDto);
    }
}
