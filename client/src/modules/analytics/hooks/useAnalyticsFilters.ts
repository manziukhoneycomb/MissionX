import { useState, useCallback } from 'react';
import { AnalyticsFilters } from '../types/analytics';
import { format } from 'date-fns';

export const useAnalyticsFilters = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const updateDateRange = useCallback((start: string, end: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
    }));
  }, []);

  const toggleTenantFilter = useCallback((tenantId: string) => {
    setFilters(prev => {
      const currentTenantIds = prev.tenantIds || [];
      const newTenantIds = currentTenantIds.includes(tenantId)
        ? currentTenantIds.filter(id => id !== tenantId)
        : [...currentTenantIds, tenantId];
      
      return {
        ...prev,
        tenantIds: newTenantIds.length > 0 ? newTenantIds : undefined,
      };
    });
  }, []);

  const toggleStatusFilter = useCallback((status: string) => {
    setFilters(prev => {
      const currentStatus = prev.status || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter(s => s !== status)
        : [...currentStatus, status];
      
      return {
        ...prev,
        status: newStatus.length > 0 ? newStatus : undefined,
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: {
        start: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd'),
      },
    });
  }, []);

  const clearTenantFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      tenantIds: undefined,
    }));
  }, []);

  const clearStatusFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      status: undefined,
    }));
  }, []);

  return {
    filters,
    setFilters,
    updateDateRange,
    toggleTenantFilter,
    toggleStatusFilter,
    clearFilters,
    clearTenantFilters,
    clearStatusFilters,
  };
};