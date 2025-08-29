import { Controller, Get, Inject } from '@nestjs/common';
import { Role } from '../../domain/entities/role.entity';
import {
    IRolesQueries,
    ROLES_QUERIES,
} from '../../application/roles/interfaces/roles-queries.interface';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@Authorize()
export class RolesController {
    constructor(@Inject(ROLES_QUERIES) private readonly rolesQueries: IRolesQueries) {}

    @Get()
    @ApiOperation({ summary: 'Get all roles', description: 'Retrieves all available roles' })
    @ApiResponse({
        status: 200,
        description: 'List of roles retrieved successfully',
        type: [Role],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(): Promise<Role[]> {
        return this.rolesQueries.findAllRoles();
    }
}
