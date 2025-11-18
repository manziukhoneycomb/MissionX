import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';

interface UsageMetric {
  label: string;
  current: number;
  limit: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

interface BillingCardProps {
  title: string;
  metrics?: UsageMetric[];
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const BillingCard: React.FC<BillingCardProps> = ({ title, metrics, action, children }) => {
  const theme = useTheme();

  const formatValue = (value: number, unit?: string, formatter?: (value: number) => string): string => {
    if (formatter) {
      return formatter(value);
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const getProgressColor = (percentage: number): 'primary' | 'warning' | 'error' => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
      }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          {action && <Box>{action}</Box>}
        </Box>

        {metrics && (
          <Box sx={{ mb: 2 }}>
            {metrics.map((metric, index) => {
              const percentage = (metric.current / metric.limit) * 100;
              const progressColor = getProgressColor(percentage);
              
              return (
                <Box key={index} sx={{ mb: index < metrics.length - 1 ? 2 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatValue(metric.current, metric.unit, metric.formatValue)} / {formatValue(metric.limit, metric.unit, metric.formatValue)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(percentage, 100)}
                    color={progressColor}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.action.hover,
                    }}
                  />
                  {percentage >= 90 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label="Near limit"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.6875rem' }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {children}
      </CardContent>
    </Card>
  );
};

export default BillingCard;