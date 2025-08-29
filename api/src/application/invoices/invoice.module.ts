import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceItem } from '../../domain/entities/invoice-item.entity';
import { InvoiceController } from '../../api/controllers/invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { InvoiceMapper } from './invoice.mapper';
import { INVOICE_SERVICE } from './interfaces/invoice.service.interface';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem])],
    controllers: [InvoiceController],
    providers: [
        {
            provide: INVOICE_SERVICE,
            useClass: InvoiceService,
        },
        InvoiceRepository,
        InvoiceMapper,
    ],
    exports: [INVOICE_SERVICE],
})
export class InvoiceModule {}
