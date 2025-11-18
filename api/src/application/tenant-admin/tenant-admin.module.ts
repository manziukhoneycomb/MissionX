import { Module } from '@nestjs/common';
import { TenantAdminController } from '../../api/controllers/tenant-admin.controller';
import { UserModule } from '../users/user.module';

@Module({
    imports: [UserModule],
    controllers: [TenantAdminController],
})
export class TenantAdminModule {}