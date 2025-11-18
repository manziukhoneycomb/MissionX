import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from '../../api/controllers/analytics.controller';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, Tenant]),
        CacheModule.register({
            ttl: 300, // 5 minutes default TTL
            max: 100, // maximum number of items in cache
        })
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService]
})
export class AnalyticsModule {}