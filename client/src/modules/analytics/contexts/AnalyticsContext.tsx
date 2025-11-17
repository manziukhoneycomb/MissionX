import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChartFilter } from '../types/analytics';
import { format, subMonths } from 'date-fns';

interface AnalyticsContextType {
  filter: ChartFilter;
  updateFilter: (updates: Partial<ChartFilter>) => void;
  resetFilter: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalyticsFilter = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsFilter must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const getDefaultFilter = (): ChartFilter => {
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 6);
    
    return {
      startDate: format(sixMonthsAgo, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
      selectedTenants: [],
    };
  };

  const [filter, setFilter] = useState<ChartFilter>(getDefaultFilter());

  const updateFilter = (updates: Partial<ChartFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  const resetFilter = () => {
    setFilter(getDefaultFilter());
  };

  return (
    <AnalyticsContext.Provider value={{ filter, updateFilter, resetFilter }}>
      {children}
    </AnalyticsContext.Provider>
  );
};