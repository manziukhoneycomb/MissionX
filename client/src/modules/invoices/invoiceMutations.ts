import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from './services/invoiceService';
import { invoiceKeys } from './invoiceQueryKeys';

/**
 * Hook to delete an invoice
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.deleteInvoice(id),
    onSuccess: () => {
      // Invalidate and refetch invoices list
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.lists(),
      });
    },
  });
};

/**
 * Hook to import an invoice from a file
 */
export const useImportInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => invoiceService.importInvoice(file),
    onSuccess: () => {
      // Invalidate and refetch invoices list
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.lists(),
      });
    },
  });
};
