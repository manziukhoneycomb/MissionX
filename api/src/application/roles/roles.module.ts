import { Module } from '@nestjs/common';
import { RolesQueries } from './roles.queries';
import { ROLES_QUERIES } from './interfaces/roles-queries.interface';

@Module({
    providers: [
        {
            provide: ROLES_QUERIES,
            useClass: RolesQueries,
        },
    ],
    exports: [ROLES_QUERIES],
})
export class RolesModule {}
