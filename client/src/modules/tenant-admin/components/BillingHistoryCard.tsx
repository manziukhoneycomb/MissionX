import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Link,
  Skeleton,
  useTheme,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { BillingHistoryItem } from '../services/mockBillingService';

interface BillingHistoryCardProps {
  billingHistory: BillingHistoryItem[];
  isLoading: boolean;
}

const BillingHistoryCard: React.FC<BillingHistoryCardProps> = ({ billingHistory, isLoading }) => {
  const theme = useTheme();

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: BillingHistoryItem['status']) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: BillingHistoryItem['status']) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="30%" />}
          subheader={<Skeleton variant="text" width="50%" />}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={60} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: theme.palette.info.light,
              color: theme.palette.info.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ReceiptIcon />
          </Box>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Billing History
          </Typography>
        }
        subheader="Your recent invoices and payments"
      />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {billingHistory.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No billing history available
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    '& th': {
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.text.secondary,
                      fontWeight: 'bold',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Invoice</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  '& tr': {
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  },
                  '& td, & th': {
                    color: theme.palette.text.primary,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 2,
                  },
                  '& tr:last-child td, & tr:last-child th': {
                    borderBottom: 0,
                  },
                }}
              >
                {billingHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatDate(item.date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ${item.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.invoiceUrl && item.status === 'paid' ? (
                        <IconButton
                          component={Link}
                          href={item.invoiceUrl}
                          target="_blank"
                          size="small"
                          color="primary"
                          sx={{
                            '&:hover': {
                              backgroundColor: theme.palette.primary.light + '20',
                            },
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingHistoryCard;