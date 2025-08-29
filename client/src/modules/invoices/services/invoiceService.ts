import axios from 'axios';
import { Invoice } from '../types/invoice';

export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const invoiceService = {
  /**
   * Get all invoices with pagination
   * @param page - Page number (starts at 1)
   * @param limit - Number of items per page
   * @returns Promise<PaginatedResponseDto<Invoice>>
   */
  getInvoices: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<Invoice>> => {
    const response = await axios.get<PaginatedResponseDto<Invoice>>('/invoices', {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Get a specific invoice by ID
   * @param id - Invoice ID
   * @returns Promise<Invoice>
   */
  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await axios.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Delete an invoice by ID
   * @param id - Invoice ID
   * @returns Promise<void>
   */
  deleteInvoice: async (id: string): Promise<void> => {
    await axios.delete(`/invoices/${id}`);
  },

  /**
   * Import an invoice from a file
   * @param file - Invoice file (XLSX)
   * @returns Promise<void>
   */
  importInvoice: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await axios.post('/invoices/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
