import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import { MetricSummary } from '../types/analytics';

interface MetricSummaryCardProps {
  title: string;
  metric: MetricSummary;
  format: 'currency' | 'number' | 'percentage';
}

const MetricSummaryCard: React.FC<MetricSummaryCardProps> = ({
  title,
  metric,
  format,
}) => {
  const theme = useTheme();

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (metric.changeType) {
      case 'increase':
        return <TrendingUpIcon fontSize="small" />;
      case 'decrease':
        return <TrendingDownIcon fontSize="small" />;
      case 'no-change':
      default:
        return <TrendingFlatIcon fontSize="small" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.changeType) {
      case 'increase':
        return theme.palette.success.main;
      case 'decrease':
        return theme.palette.error.main;
      case 'no-change':
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Typography variant="overline" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
          {formatValue(metric.current)}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getTrendIcon()}
            label={`${metric.changePercent >= 0 ? '+' : ''}${metric.changePercent.toFixed(1)}%`}
            size="small"
            sx={{
              color: getTrendColor(),
              backgroundColor: `${getTrendColor()}15`,
              fontWeight: 'medium',
              '& .MuiChip-icon': {
                color: getTrendColor(),
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            vs previous period
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Previous: {formatValue(metric.previous)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricSummaryCard;