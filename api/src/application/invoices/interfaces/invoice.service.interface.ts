import { InvoiceDto } from '../dto/invoice.dto';
import { PaginatedResponseDto } from '../dto/pagination.dto';
import { PaginationParamsDto } from '../dto/pagination.dto';

export const INVOICE_SERVICE = 'INVOICE_SERVICE';

export interface IInvoiceService {
    findAll(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<InvoiceDto>>;

    findById(id: string, tenantId: string): Promise<InvoiceDto>;

    importFromBuffer(buffer: Buffer, tenantId: string): Promise<InvoiceDto>;

    remove(id: string, tenantId: string): Promise<void>;
}
