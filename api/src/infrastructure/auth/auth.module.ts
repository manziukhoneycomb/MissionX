import { Module, Global } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { RolesGuard } from './guards/roles.guard';
import { TeamAuthModule } from './team-auth.module';

@Global()
@Module({
    imports: [PersistenceModule, TeamAuthModule],
    providers: [RolesGuard],
    exports: [RolesGuard, TeamAuthModule],
})
export class AuthModule {}
