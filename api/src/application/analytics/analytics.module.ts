import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from '../../api/controllers/analytics.controller';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { ANALYTICS_SERVICE } from './interfaces/analytics.service.interface';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, Tenant]),
        CacheModule.register({
            ttl: 300000, // 5 minutes
            max: 100, // Maximum number of items in cache
        }),
    ],
    controllers: [AnalyticsController],
    providers: [
        {
            provide: ANALYTICS_SERVICE,
            useClass: AnalyticsService,
        },
    ],
    exports: [ANALYTICS_SERVICE],
})
export class AnalyticsModule {}