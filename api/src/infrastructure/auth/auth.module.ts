import { Module, Global } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
    imports: [PersistenceModule],
    providers: [RolesGuard],
    exports: [RolesGuard],
})
export class AuthModule {}
