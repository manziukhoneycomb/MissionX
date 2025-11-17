import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnalyticsQueryDto } from '../types/analytics';

interface AnalyticsContextType {
  selectedTenant: string | null;
  selectedDateRange: { startDate: string; endDate: string } | null;
  selectedStatus: string | null;
  selectedPaymentMethod: string | null;
  globalQuery: AnalyticsQueryDto;
  setSelectedTenant: (tenantId: string | null) => void;
  setSelectedDateRange: (range: { startDate: string; endDate: string } | null) => void;
  setSelectedStatus: (status: string | null) => void;
  setSelectedPaymentMethod: (method: string | null) => void;
  setGlobalQuery: (query: AnalyticsQueryDto) => void;
  resetFilters: () => void;
  exportData: (data: any, filename: string, type: 'json' | 'csv') => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [globalQuery, setGlobalQuery] = useState<AnalyticsQueryDto>({});

  const resetFilters = () => {
    setSelectedTenant(null);
    setSelectedDateRange(null);
    setSelectedStatus(null);
    setSelectedPaymentMethod(null);
  };

  const exportData = (data: any, filename: string, type: 'json' | 'csv') => {
    let content: string;
    let mimeType: string;
    let fileExtension: string;

    if (type === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else {
      // Convert to CSV
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          ).join(',')
        ).join('\n');
        content = `${headers}\n${rows}`;
      } else {
        content = 'No data available';
      }
      mimeType = 'text/csv';
      fileExtension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const value: AnalyticsContextType = {
    selectedTenant,
    selectedDateRange,
    selectedStatus,
    selectedPaymentMethod,
    globalQuery,
    setSelectedTenant,
    setSelectedDateRange,
    setSelectedStatus,
    setSelectedPaymentMethod,
    setGlobalQuery,
    resetFilters,
    exportData,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};