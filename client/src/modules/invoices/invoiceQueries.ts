import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';

/**
 * Hook to fetch all invoices
 * @param searchTerm - Optional search term to filter invoices
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 */
export const useInvoices = (searchTerm = '', page = 1, limit = 10) => {
  return useQuery({
    queryKey: invoiceKeys.list(searchTerm, page, limit),
    queryFn: async () => {
      const paginatedResponse = await invoiceService.getInvoices(page, limit);

      // If there's a search term, we filter the items
      if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const filteredItems = paginatedResponse.items.filter(
          (invoice) =>
            invoice.invoiceNumber.toLowerCase().includes(lowerCaseSearch) ||
            invoice.vendorName.toLowerCase().includes(lowerCaseSearch) ||
            invoice.customerName.toLowerCase().includes(lowerCaseSearch),
        );

        // Return filtered items with updated counts
        return {
          ...paginatedResponse,
          items: filteredItems,
          total: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / limit),
        };
      }

      return paginatedResponse;
    },
  });
};

/**
 * Hook to fetch a single invoice by ID
 */
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.getInvoice(id),
    enabled: !!id, // Only run if ID is provided
  });
};
