import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { AnalyticsService } from './analytics.service';
import { ANALYTICS_SERVICE } from './interfaces/analytics.service.interface';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, Tenant]),
    ],
    providers: [
        {
            provide: ANALYTICS_SERVICE,
            useClass: AnalyticsService,
        },
    ],
    exports: [ANALYTICS_SERVICE],
})
export class AnalyticsModule {}