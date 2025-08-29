import { Injectable } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceItem } from '../../domain/entities/invoice-item.entity';
import { InvoiceDto } from './dto/invoice.dto';
import { InvoiceItemDto } from './dto/invoice-item.dto';
import { PaginatedResponseDto } from './dto/pagination.dto';

@Injectable()
export class InvoiceMapper {
    toDto(entity: Invoice): InvoiceDto {
        const dto = new InvoiceDto();
        dto.id = entity.id;
        dto.invoiceNumber = entity.invoiceNumber;
        dto.issueDate = entity.issueDate;
        dto.dueDate = entity.dueDate;
        dto.vendorName = entity.vendorName;
        dto.vendorAddress = entity.vendorAddress;
        dto.vendorPhone = entity.vendorPhone;
        dto.vendorEmail = entity.vendorEmail;
        dto.customerName = entity.customerName;
        dto.customerAddress = entity.customerAddress;
        dto.customerPhone = entity.customerPhone;
        dto.customerEmail = entity.customerEmail;
        dto.subtotal = entity.subtotal;
        dto.discount = entity.discount;
        dto.taxRate = entity.taxRate;
        dto.taxAmount = entity.taxAmount;
        dto.totalAmount = entity.totalAmount;
        dto.tenantId = entity.tenantId;
        dto.items = entity.items ? entity.items.map((item) => this.toItemDto(item)) : [];

        return dto;
    }

    toDtoList(entities: Invoice[]): InvoiceDto[] {
        return entities.map((entity) => this.toDto(entity));
    }

    toPaginatedResponse(
        entities: Invoice[],
        total: number,
        page: number,
        limit: number,
    ): PaginatedResponseDto<InvoiceDto> {
        const response = new PaginatedResponseDto<InvoiceDto>();
        response.items = this.toDtoList(entities);
        response.total = total;
        response.page = page;
        response.limit = limit;
        response.totalPages = Math.ceil(total / limit);

        return response;
    }

    private toItemDto(entity: InvoiceItem): InvoiceItemDto {
        const dto = new InvoiceItemDto();
        dto.id = entity.id;
        dto.invoiceId = entity.invoiceId;
        dto.lineNumber = entity.lineNumber;
        dto.description = entity.description;
        dto.quantity = entity.quantity;
        dto.unitPrice = entity.unitPrice;
        dto.amount = entity.amount;

        return dto;
    }
}
