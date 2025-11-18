import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from '../../api/controllers/analytics.controller';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { AnalyticsQueryValidator } from './validators/analytics-query.validator';
import { AnalyticsErrorInterceptor } from './interceptors/analytics-error.interceptor';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, Tenant]),
    ],
    controllers: [AnalyticsController],
    providers: [
        AnalyticsService,
        AnalyticsQueryValidator,
        AnalyticsErrorInterceptor,
    ],
    exports: [AnalyticsService],
})
export class AnalyticsModule {}