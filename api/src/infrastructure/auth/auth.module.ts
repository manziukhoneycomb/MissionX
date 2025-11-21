import { Module, Global } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { RolesGuard } from './guards/roles.guard';
import { PermissionResolutionService } from './permission-resolution.service';
import { TenantMiddleware } from '../middleware/tenant.middleware';
import { TeamContextMiddleware } from '../middleware/team-context.middleware';

@Global()
@Module({
    imports: [PersistenceModule],
    providers: [RolesGuard, PermissionResolutionService, TenantMiddleware, TeamContextMiddleware],
    exports: [RolesGuard, PermissionResolutionService, TenantMiddleware, TeamContextMiddleware],
})
export class AuthModule {}
