import React from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { useAnalyticsFilter } from '../contexts/AnalyticsContext';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';

// Mock tenant data - in real app this would come from API
const mockTenants = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'Tech Solutions' },
  { id: '3', name: 'Global Industries' },
  { id: '4', name: 'Innovation Labs' },
];

const AnalyticsFilters: React.FC = () => {
  const { filter, updateFilter, resetFilter } = useAnalyticsFilter();
  const userRoles = useUserRoles();
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      updateFilter({ startDate: format(date, 'yyyy-MM-dd') });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      updateFilter({ endDate: format(date, 'yyyy-MM-dd') });
    }
  };

  const handleTenantChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    updateFilter({ 
      selectedTenants: typeof value === 'string' ? value.split(',') : value 
    });
  };

  const handleQuickRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    updateFilter({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3} alignItems="center">
        {/* Date Range */}
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="Start Date"
            value={parseISO(filter.startDate)}
            onChange={handleStartDateChange}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="End Date"
            value={parseISO(filter.endDate)}
            onChange={handleEndDateChange}
            slotProps={{
              textField: { size: 'small', fullWidth: true },
            }}
          />
        </Grid>

        {/* Quick Date Range Buttons */}
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickRange(30)}
            >
              30d
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickRange(90)}
            >
              90d
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickRange(180)}
            >
              6m
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickRange(365)}
            >
              1y
            </Button>
          </Box>
        </Grid>

        {/* Tenant Filter - Only for Super Admin */}
        {isSuperAdmin && (
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Tenants</InputLabel>
              <Select
                multiple
                value={filter.selectedTenants}
                onChange={handleTenantChange}
                input={<OutlinedInput label="Tenants" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((tenantId) => {
                      const tenant = mockTenants.find(t => t.id === tenantId);
                      return (
                        <Chip
                          key={tenantId}
                          label={tenant?.name || tenantId}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {mockTenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Reset Button */}
        <Grid item xs="auto">
          <Button
            variant="outlined"
            color="secondary"
            onClick={resetFilter}
            size="small"
          >
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default AnalyticsFilters;