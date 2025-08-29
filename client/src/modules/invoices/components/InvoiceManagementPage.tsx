import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Divider, Paper } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { useInvoices } from '../invoiceQueries';
import InvoiceTable from './InvoiceTable';
import InvoiceDetails from './InvoiceDetails';
import ChatDrawer from './ChatDrawer';
import { useInvoice } from '../invoiceQueries';
import { useUser } from '@clerk/clerk-react';
import { PaginatedResponseDto } from '../services/invoiceService';
import { Invoice } from '../types/invoice';

/**
 * Main invoice management page
 * Only accessible to users with 'Super Admin' role
 */
const InvoiceManagementPage: React.FC = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState<string | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { user } = useUser();
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes('Super Admin');

  // Fetch all invoices with pagination
  const {
    data: paginatedInvoices = {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    } as PaginatedResponseDto<Invoice>,
    isLoading: isInvoicesLoading,
  } = useInvoices(searchTerm, page, limit);

  // Fetch selected invoice details
  const { data: selectedInvoice, isLoading: isInvoiceLoading } = useInvoice(
    selectedInvoiceId || '',
  );

  // Reset highlighted invoice after animation
  useEffect(() => {
    if (highlightedInvoiceId) {
      const timer = setTimeout(() => {
        setHighlightedInvoiceId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightedInvoiceId]);

  // Handle view invoice
  const handleViewInvoice = (id: string) => {
    setSelectedInvoiceId(id);
  };

  // Handle back to invoice list
  const handleBackToList = () => {
    setSelectedInvoiceId(null);
  };

  // Handle AI assistant drawer toggle
  const handleToggleChatDrawer = () => {
    setIsChatDrawerOpen(!isChatDrawerOpen);
  };

  // Handle highlighting invoice
  const handleHighlightInvoice = (id: string) => {
    setHighlightedInvoiceId(id);
    setSelectedInvoiceId(null);
    setIsChatDrawerOpen(false);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  // Apply custom styles to fix pagination alignment
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-select {
        display: flex;
        align-items: center;
        margin: 0;
      }
      .MuiTablePagination-selectLabel {
        margin-right: 8px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // If user is not a Super Admin, show access denied message
  if (!isSuperAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to access the Invoice Management page. Please contact your
            administrator.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // If an invoice is selected, show only the details
  if (selectedInvoiceId) {
    return (
      <Container
        maxWidth={false}
        sx={{
          mt: 1,
          mb: 1,
          width: '100%',
          maxWidth: '1400px',
          px: { xs: 2, sm: 3 },
        }}>
        <InvoiceDetails
          invoice={selectedInvoice}
          isLoading={isInvoiceLoading}
          onBack={handleBackToList}
          onToggleAIAssistant={handleToggleChatDrawer}
        />

        {/* Chat Drawer */}
        <ChatDrawer
          open={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          onHighlightInvoice={handleHighlightInvoice}
        />
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        mt: 2,
        mb: 2,
        width: '100%',
        maxWidth: '1400px',
        px: { xs: 2, sm: 3 },
      }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Invoice Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AIIcon />}
            onClick={handleToggleChatDrawer}>
            AI Assistant
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Main Content - Invoice Table */}
      <InvoiceTable
        paginatedData={paginatedInvoices}
        isLoading={isInvoicesLoading}
        onViewInvoice={handleViewInvoice}
        highlightedInvoiceId={highlightedInvoiceId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        open={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        onHighlightInvoice={handleHighlightInvoice}
      />
    </Container>
  );
};

export default InvoiceManagementPage;
