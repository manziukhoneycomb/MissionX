import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid as MuiGrid,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Tabs,
  Tab,
  SxProps,
  Theme,
} from '@mui/material';
import {
  KeyboardBackspace as BackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Invoice } from '../types/invoice';

// Use Grid from @mui/material with correct props
const Grid = MuiGrid;

interface InvoiceDetailsProps {
  invoice: Invoice | undefined;
  isLoading: boolean;
  onBack: () => void;
  onToggleAIAssistant?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  sx?: SxProps<Theme>;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, sx = {}, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      sx={{
        padding: '16px 0',
        ...(typeof sx === 'object' ? sx : {}),
      }}
      {...other}>
      {value === index && children}
    </Box>
  );
};

/**
 * Invoice details component
 */
const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoice,
  isLoading,
  onBack,
  onToggleAIAssistant,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
      return format(new Date(dateString), 'MMMM d, yyyy');
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF for download
    console.log('Download invoice as PDF');
    alert('PDF generation would happen here in a real app');
  };

  // Render loading skeleton or invoice details
  if (isLoading || !invoice) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBack}>
            <BackIcon />
          </IconButton>
          <Skeleton variant="text" width={300} height={40} sx={{ ml: 2 }} />
        </Box>

        <Grid container spacing={2}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" width="100%" height={80} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with back button and actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Invoice #{invoice.invoiceNumber}
          </Typography>
          <Chip
            label={isOverdue(invoice.dueDate) ? 'Overdue' : 'Active'}
            color={isOverdue(invoice.dueDate) ? 'error' : 'success'}
            sx={{ ml: 1, fontWeight: 'medium' }}
            size="small"
          />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} size="small">
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            size="small">
            Download
          </Button>
          {onToggleAIAssistant && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AIIcon />}
              onClick={onToggleAIAssistant}
              size="small">
              AI Assistant
            </Button>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Summary Row */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 1, pb: '8px !important' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                fontSize="0.7rem">
                Issue Date
              </Typography>
              <Typography variant="body2" fontWeight="medium" fontSize="0.85rem">
                {formatDate(invoice.issueDate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 1, pb: '8px !important' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                fontSize="0.7rem">
                Due Date
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                fontSize="0.85rem"
                color={isOverdue(invoice.dueDate) ? 'error.main' : 'inherit'}>
                {formatDate(invoice.dueDate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 1, pb: '8px !important' }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                fontSize="0.7rem">
                Subtotal
              </Typography>
              <Typography variant="body2" fontWeight="medium" fontSize="0.85rem">
                {formatCurrency(invoice.subtotal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
            <CardContent sx={{ p: 1, pb: '8px !important' }}>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                display="block"
                fontSize="0.7rem">
                Total
              </Typography>
              <Typography variant="body1" fontWeight="bold" fontSize="0.9rem">
                {formatCurrency(invoice.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different sections */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Line Items" />
        <Tab label="Vendor & Customer" />
        <Tab label="Terms & Conditions" />
      </Tabs>

      {/* Line Items */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper} sx={{ maxHeight: '300px', overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.lineNumber}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}

              {/* Summary rows */}
              <TableRow>
                <TableCell colSpan={3} />
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    Subtotal
                  </Typography>
                </TableCell>
                <TableCell align="right">{formatCurrency(invoice.subtotal)}</TableCell>
              </TableRow>

              {invoice.discount > 0 && (
                <TableRow>
                  <TableCell colSpan={3} />
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      Discount
                    </Typography>
                  </TableCell>
                  <TableCell align="right">-{formatCurrency(invoice.discount)}</TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell colSpan={3} />
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    Tax ({(invoice.taxRate * 100).toFixed(2)}%)
                  </Typography>
                </TableCell>
                <TableCell align="right">{formatCurrency(invoice.taxAmount)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={3} />
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    Total
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold" color="primary.main">
                    {formatCurrency(invoice.totalAmount)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Vendor and Customer Information */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ height: '100%', border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Vendor
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {invoice.vendorName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                  {invoice.vendorAddress}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {invoice.vendorPhone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {invoice.vendorEmail}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ height: '100%', border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Customer
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {invoice.customerName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                  {invoice.customerAddress}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {invoice.customerPhone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {invoice.customerEmail}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Terms & Conditions */}
      <TabPanel value={tabValue} index={2}>
        {invoice.terms ? (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Terms & Conditions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.terms}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No terms and conditions specified for this invoice.
          </Typography>
        )}
      </TabPanel>
    </Box>
  );
};

export default InvoiceDetails;
