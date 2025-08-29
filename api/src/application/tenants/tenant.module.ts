import { Module } from '@nestjs/common';
import { TenantCommands } from './tenant.commands';
import { TenantQueries } from './tenant.queries';
import { TENANT_COMMANDS } from './interfaces/tenant-commands.interface';
import { TENANT_QUERIES } from './interfaces/tenant-queries.interface';

@Module({
    providers: [
        {
            provide: TENANT_COMMANDS,
            useClass: TenantCommands,
        },
        {
            provide: TENANT_QUERIES,
            useClass: TenantQueries,
        },
    ],
    exports: [TENANT_COMMANDS, TENANT_QUERIES],
})
export class TenantModule {}
