import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GetAppIcon from '@mui/icons-material/GetApp';

interface TenantMetric {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  averageInvoiceValue: number;
  totalRevenue: number;
  paymentTimeliness: number;
}

interface TenantMetricsProps {
  data: TenantMetric[];
  onExport: () => void;
}

type SortField = 'tenantName' | 'invoiceCount' | 'averageInvoiceValue' | 'totalRevenue' | 'paymentTimeliness';
type SortDirection = 'asc' | 'desc';

const SimpleTenantMetrics: React.FC<TenantMetricsProps> = ({ data, onExport }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getTimelinessColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Tenant Performance
          </Typography>
          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'tenantName'}
                    direction={sortField === 'tenantName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('tenantName')}
                  >
                    Tenant
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'invoiceCount'}
                    direction={sortField === 'invoiceCount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('invoiceCount')}
                  >
                    Invoices
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'averageInvoiceValue'}
                    direction={sortField === 'averageInvoiceValue' ? sortDirection : 'asc'}
                    onClick={() => handleSort('averageInvoiceValue')}
                  >
                    Avg Value
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'totalRevenue'}
                    direction={sortField === 'totalRevenue' ? sortDirection : 'asc'}
                    onClick={() => handleSort('totalRevenue')}
                  >
                    Total Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'paymentTimeliness'}
                    direction={sortField === 'paymentTimeliness' ? sortDirection : 'asc'}
                    onClick={() => handleSort('paymentTimeliness')}
                  >
                    Payment Timeliness
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((tenant) => (
                <TableRow key={tenant.tenantId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {tenant.tenantName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {tenant.tenantId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={tenant.invoiceCount} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${tenant.averageInvoiceValue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${tenant.totalRevenue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 60 }}>
                        <LinearProgress
                          variant="determinate"
                          value={tenant.paymentTimeliness}
                          color={getTimelinessColor(tenant.paymentTimeliness)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {tenant.paymentTimeliness}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Summary
          </Typography>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Tenants
              </Typography>
              <Typography variant="h6">
                {data.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Avg Revenue per Tenant
              </Typography>
              <Typography variant="h6">
                ${Math.round(data.reduce((sum, tenant) => sum + tenant.totalRevenue, 0) / data.length).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Top Performer
              </Typography>
              <Typography variant="h6">
                {data.length > 0 && data.reduce((max, tenant) => tenant.totalRevenue > max.totalRevenue ? tenant : max).tenantName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Avg Payment Timeliness
              </Typography>
              <Typography variant="h6">
                {Math.round(data.reduce((sum, tenant) => sum + tenant.paymentTimeliness, 0) / data.length)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={onExport}>
          <GetAppIcon sx={{ mr: 1 }} />
          Export Data (CSV)
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default SimpleTenantMetrics;