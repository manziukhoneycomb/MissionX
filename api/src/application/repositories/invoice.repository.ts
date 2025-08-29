import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { PaginationParamsDto } from '../invoices/dto/pagination.dto';

@Injectable()
export class InvoiceRepository {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
    ) {}

    async findAll(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<[Invoice[], number]> {
        const page = paginationParams.page ?? 1;
        const limit = paginationParams.limit ?? 10;
        const skip = (page - 1) * limit;

        return this.invoiceRepository.findAndCount({
            where: { tenantId },
            skip,
            take: limit,
            order: {
                issueDate: 'DESC',
            },
        });
    }

    async findById(id: string, tenantId: string): Promise<Invoice | null> {
        return this.invoiceRepository.findOne({
            where: { id, tenantId },
            relations: ['items'],
        });
    }

    async save(invoice: Invoice): Promise<Invoice> {
        return this.invoiceRepository.save(invoice);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        await this.invoiceRepository.delete(id);
    }
}
