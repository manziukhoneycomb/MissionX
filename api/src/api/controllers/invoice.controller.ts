import {
    Controller,
    Get,
    Param,
    Post,
    Delete,
    Req,
    UploadedFile,
    UseInterceptors,
    HttpStatus,
    HttpCode,
    Query,
    Inject,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { InvoiceDto } from '../../application/invoices/dto/invoice.dto';
import {
    PaginatedResponseDto,
    PaginationParamsDto,
} from '../../application/invoices/dto/pagination.dto';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    INVOICE_SERVICE,
    IInvoiceService,
} from '../../application/invoices/interfaces/invoice.service.interface';

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
    constructor(@Inject(INVOICE_SERVICE) private readonly invoiceService: IInvoiceService) {}

    @Get()
    @Authorize(RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get all invoices',
        description: 'Retrieves all invoices with pagination',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (starts from 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of invoices retrieved successfully',
        type: PaginatedResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires SUPER_ADMIN role' })
    async findAll(
        @Req() request: RequestWithTenant,
        @Query() paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<InvoiceDto>> {
        const tenantId = request.tenantId!;
        return this.invoiceService.findAll(tenantId, paginationParams);
    }

    @Get(':id')
    @Authorize(RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice by ID',
        description: 'Retrieves a specific invoice by ID with all its items',
    })
    @ApiParam({ name: 'id', description: 'Invoice ID', type: String })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice retrieved successfully',
        type: InvoiceDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Invoice not found',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires SUPER_ADMIN role' })
    async findOne(@Param('id') id: string, @Req() request: RequestWithTenant): Promise<InvoiceDto> {
        const tenantId = request.tenantId!;
        return this.invoiceService.findById(id, tenantId);
    }

    @Post('import')
    @Authorize(RoleName.USER, RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({
        summary: 'Import invoice from Excel',
        description: 'Imports an invoice from an uploaded Excel file',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Excel file to upload',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Invoice imported successfully',
        type: InvoiceDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async importFromExcel(
        @UploadedFile() file: MulterFile,
        @Req() request: RequestWithTenant,
    ): Promise<InvoiceDto> {
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }

        const tenantId = request.tenantId!;
        return this.invoiceService.importFromBuffer(file.buffer, tenantId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Authorize(RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Delete an invoice',
        description: 'Deletes an invoice and all its line items by ID',
    })
    @ApiParam({ name: 'id', description: 'Invoice ID', type: String })
    @ApiNoContentResponse({ description: 'Invoice deleted successfully' })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Invoice not found',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires SUPER_ADMIN role' })
    async remove(@Param('id') id: string, @Req() request: RequestWithTenant): Promise<void> {
        const tenantId = request.tenantId!;
        await this.invoiceService.remove(id, tenantId);
    }
}
