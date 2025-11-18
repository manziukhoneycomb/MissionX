import React, { createContext, useContext, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { subMonths, format } from 'date-fns';
import { AnalyticsFilters } from '../services/analyticsService';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatus from './InvoiceStatus';
import PaymentDistribution from './PaymentDistribution';

interface AnalyticsContextType {
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalyticsFilters = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsFilters must be used within AnalyticsProvider');
  }
  return context;
};

const AnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const handleTenantFilter = (tenantId: string) => {
    setFilters({
      ...filters,
      tenantId: tenantId === 'all' ? undefined : tenantId,
    });
  };

  return (
    <AnalyticsContext.Provider value={{ filters, setFilters }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2} sx={{ alignItems: 'end' }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={filters.startDate || ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={filters.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Tenant Filter</InputLabel>
                  <Select
                    value={filters.tenantId || 'all'}
                    label="Tenant Filter"
                    onChange={(e) => handleTenantFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Tenants</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Trends
                </Typography>
                <RevenueChart />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Invoice Status Overview
                </Typography>
                <InvoiceStatus />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tenant Performance
                </Typography>
                <TenantMetrics />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Distribution
                </Typography>
                <PaymentDistribution />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsPage;