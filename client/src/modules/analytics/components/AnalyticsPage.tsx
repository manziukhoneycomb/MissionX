import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { format, subDays } from 'date-fns';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RefreshIcon from '@mui/icons-material/Refresh';

import ProtectedRoute from '../../../common/components/ProtectedRoute';
import { ROLES } from '../../../common/constants/roles';
import { DateRange } from '../types/analytics';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatus from './InvoiceStatus';
import PaymentDistribution from './PaymentDistribution';

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateRangeChange = (field: keyof DateRange, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const isValidDateRange = dateRange.startDate && dateRange.endDate && 
    new Date(dateRange.startDate) <= new Date(dateRange.endDate);

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <Box>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AnalyticsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" color="primary">
                Analytics Dashboard
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="large"
            >
              Refresh Data
            </Button>
          </Box>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Date Range Filter
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="Start Date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Button 
                  variant="contained" 
                  disabled={!isValidDateRange}
                  onClick={() => setRefreshKey(prev => prev + 1)}
                >
                  Apply Filter
                </Button>
              </Stack>
              {!isValidDateRange && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Please select a valid date range where start date is before or equal to end date.
                </Alert>
              )}
            </CardContent>
          </Card>

          {isValidDateRange && (
            <Grid container spacing={3}>
              {/* Revenue Chart */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Revenue Trends
                    </Typography>
                    <RevenueChart 
                      dateRange={dateRange} 
                      refreshKey={refreshKey}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Invoice Status Overview */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Invoice Status
                    </Typography>
                    <InvoiceStatus 
                      dateRange={dateRange} 
                      refreshKey={refreshKey}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Tenant Metrics */}
              <Grid item xs={12} lg={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Tenant Performance
                    </Typography>
                    <TenantMetrics 
                      dateRange={dateRange} 
                      refreshKey={refreshKey}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Distribution */}
              <Grid item xs={12} lg={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Payment Distribution
                    </Typography>
                    <PaymentDistribution 
                      dateRange={dateRange} 
                      refreshKey={refreshKey}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;