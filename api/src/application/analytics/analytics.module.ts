import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { AnalyticsService } from './analytics.service';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice, Tenant])],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule {}