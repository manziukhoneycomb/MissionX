import React, { useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  Card,
  CardHeader,
  CardContent,
  Button,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import SecretEditDialog from './SecretEditDialog';
import { useQuery } from '@tanstack/react-query';
import { getSecrets } from '../secretQueries';
import { SecretDto } from '../types/secret-dto';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { useSecretsPageStore } from '../stores/secretsPageStore';
import { useSecretEditDialogStore } from '../stores/secretEditDialogStore';
import { SECRET_QUERY_KEYS } from '../secretQueryKeys';

const SecretsPage: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const { visibility, initializeVisibility, toggleVisibility } = useSecretsPageStore();
  const openEditDialog = useSecretEditDialogStore((state) => state.openDialog);

  const {
    data: secretsData,
    isLoading,
    error: queryError,
    isSuccess,
  } = useQuery({
    queryKey: [SECRET_QUERY_KEYS.GET_SECRETS],
    queryFn: getSecrets,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const secrets = useMemo(() => secretsData?.data ?? [], [secretsData]);

  useEffect(() => {
    if (isSuccess && secrets.length > 0) {
      initializeVisibility(secrets.map((secret: SecretDto) => secret.key));
    }
  }, [secrets, isSuccess, initializeVisibility]);

  useEffect(() => {
    if (queryError) {
      enqueueSnackbar(queryError?.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [queryError, enqueueSnackbar]);

  const handleOpenEditForm = (key: string): void => {
    const secret = secrets.find((s) => s.key === key);
    if (secret) {
      openEditDialog(secret.key, secret.value ?? '');
    }
  };

  const toggleLocalVisibility = useCallback(
    (key: string) => {
      toggleVisibility(key);
    },
    [toggleVisibility],
  );

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', p: 2 }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}>
        <CardHeader
          title={
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              Secrets
            </Typography>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isLoading && !secrets && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && (
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="secrets table" stickyHeader>
                <TableHead
                  sx={{
                    '& th': {
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.text.secondary,
                      fontWeight: 'bold',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}>
                  <TableRow>
                    <TableCell sx={{ width: '30%' }}>Key</TableCell>
                    <TableCell sx={{ width: '50%' }}>Value</TableCell>
                    <TableCell align="right" sx={{ width: '20%' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '& td, & th': {
                      color: theme.palette.text.primary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1,
                    },
                  }}>
                  {secrets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        No secrets found.
                      </TableCell>
                    </TableRow>
                  )}
                  {secrets.map((secret: SecretDto) => {
                    const isVisible = visibility[secret.key] ?? false;
                    const displayValue: string = isVisible ? (secret.value ?? '') : '••••••••';

                    return (
                      <TableRow
                        key={secret.key}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': {
                            border: 0,
                          },
                        }}>
                        <TableCell component="th" scope="row">
                          {secret.key}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 0,
                          }}>
                          {displayValue}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => toggleLocalVisibility(secret.key)}
                            aria-label={isVisible ? 'Hide value' : 'Show value'}
                            size="small"
                            sx={{ mr: 1 }}>
                            {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                          <Button
                            variant="text"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEditForm(secret.key)}
                            aria-label="Edit secret"
                            size="small"
                            sx={{
                              color: theme.palette.primary.main,
                              textTransform: 'none',
                              '& .MuiButton-startIcon': { mr: 0.5 },
                            }}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <SecretEditDialog />
    </Box>
  );
};

export default SecretsPage;
