import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import {
    ITenantCommands,
    TENANT_COMMANDS,
} from '../../application/tenants/interfaces/tenant-commands.interface';
import {
    ITenantQueries,
    TENANT_QUERIES,
} from '../../application/tenants/interfaces/tenant-queries.interface';
import { CreateTenantDto } from '../../application/tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../../application/tenants/dto/update-tenant.dto';
import { TenantDto } from '../../application/tenants/dto/tenant.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
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
    ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@Authorize(RoleName.SUPER_ADMIN)
export class TenantController {
    constructor(
        @Inject(TENANT_COMMANDS) private readonly tenantCommands: ITenantCommands,
        @Inject(TENANT_QUERIES) private readonly tenantQueries: ITenantQueries,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create tenant', description: 'Creates a new tenant' })
    @ApiBody({ type: CreateTenantDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tenant created successfully',
        type: TenantDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantDto> {
        return this.tenantCommands.createTenant(createTenantDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tenants', description: 'Retrieves all tenants' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of tenants retrieved successfully',
        type: [TenantDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async findAll(): Promise<TenantDto[]> {
        return this.tenantQueries.findAllTenants();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get tenant by ID', description: 'Retrieves a specific tenant by ID' })
    @ApiParam({
        name: 'id',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant retrieved successfully',
        type: TenantDto,
    })
    @ApiNotFoundResponse({ description: 'Tenant not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async findOne(@Param('id') id: string): Promise<TenantDto> {
        return this.tenantQueries.findTenantById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update tenant', description: 'Updates an existing tenant' })
    @ApiParam({
        name: 'id',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiBody({ type: UpdateTenantDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant updated successfully',
        type: TenantDto,
    })
    @ApiNotFoundResponse({ description: 'Tenant not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async update(
        @Param('id') id: string,
        @Body() updateTenantDto: UpdateTenantDto,
    ): Promise<TenantDto> {
        return this.tenantCommands.updateTenant(id, updateTenantDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete tenant', description: 'Deletes a tenant' })
    @ApiParam({
        name: 'id',
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Tenant deleted successfully' })
    @ApiNotFoundResponse({ description: 'Tenant not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires super admin role' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.tenantCommands.deleteTenant(id);
    }
}
