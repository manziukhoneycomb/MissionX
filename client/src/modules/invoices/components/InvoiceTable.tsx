import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Chip,
  Skeleton,
  keyframes,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Invoice } from '../types/invoice';
import { useDeleteInvoice } from '../invoiceMutations';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { PaginatedResponseDto } from '../services/invoiceService';

// Define the pulse animation
const pulseAnimation = keyframes`
  0% {
    background-color: rgba(31, 184, 170, 0);
  }
  50% {
    background-color: rgba(31, 184, 170, 0.3);
  }
  100% {
    background-color: rgba(31, 184, 170, 0);
  }
`;

interface InvoiceTableProps {
  paginatedData: PaginatedResponseDto<Invoice>;
  isLoading: boolean;
  onViewInvoice: (id: string) => void;
  highlightedInvoiceId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

/**
 * Invoice table component with pagination, search, and row actions
 */
const InvoiceTable: React.FC<InvoiceTableProps> = ({
  paginatedData,
  isLoading,
  onViewInvoice,
  highlightedInvoiceId,
  searchTerm,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const deleteInvoiceMutation = useDeleteInvoice();

  const invoices = paginatedData?.items || [];
  const totalCount = paginatedData?.total || 0;
  const page = paginatedData?.page ? paginatedData.page - 1 : 0; // Convert to 0-based for MUI
  const rowsPerPage = paginatedData?.limit || 10;

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1); // Convert back to 1-based for API
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onRowsPerPageChange(newRowsPerPage);
    onPageChange(1); // Reset to first page
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!invoiceToDelete) return;

    deleteInvoiceMutation.mutate(invoiceToDelete, {
      onSuccess: () => {
        enqueueSnackbar('Invoice deleted successfully', { variant: 'success' });
        setDeleteDialogOpen(false);
        setInvoiceToDelete(null);
      },
      onError: (error) => {
        console.error('Error deleting invoice:', error);
        enqueueSnackbar('Failed to delete invoice', { variant: 'error' });
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Check if an invoice is overdue
  const isOverdue = (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  // Calculate and display the status of an invoice
  const getInvoiceStatus = (invoice: Invoice) => {
    const overdue = isOverdue(invoice.dueDate);

    return (
      <Chip
        label={overdue ? 'Overdue' : 'Active'}
        color={overdue ? 'error' : 'success'}
        size="small"
        sx={{ fontWeight: 'medium' }}
      />
    );
  };

  return (
    <>
      <Box mb={2}>
        <TextField
          fullWidth
          placeholder="Search invoices by number, vendor or customer name..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}>
        <Table aria-label="invoice table">
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from(new Array(8)).map((_, cellIndex) => (
                    <TableCell key={`cell-${index}-${cellIndex}`}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    ...(highlightedInvoiceId === invoice.id && {
                      animation: `${pulseAnimation} 2s ease-in-out`,
                    }),
                  }}
                  onClick={() => onViewInvoice(invoice.id)}>
                  <TableCell>
                    <Typography fontWeight="medium">{invoice.invoiceNumber}</Typography>
                  </TableCell>
                  <TableCell>{invoice.vendorName}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>{getInvoiceStatus(invoice)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewInvoice(invoice.id);
                          }}
                          size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Invoice">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(invoice.id);
                          }}
                          size="small"
                          color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {searchTerm ? 'No invoices found matching your search.' : 'No invoices found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invoice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteInvoiceMutation.isPending}>
            {deleteInvoiceMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceTable;
