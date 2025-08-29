import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TenantForm from '../components/TenantForm.tsx';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTenants } from '../tenantQueries.ts';
import { deleteTenant } from '../tenantMutations.ts';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes.ts';
import { useTenantManagementStore } from '../stores/tenantManagementStore';
import { TENANT_QUERY_KEYS } from '../tenantQueryKeys.ts';

type TenantManagementPageProps = Record<string, unknown>;

const TenantManagementPage: React.FC<TenantManagementPageProps> = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    isFormOpen,
    selectedTenant,
    isConfirmDeleteDialogOpen,
    tenantToDeleteId,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
  } = useTenantManagementStore();

  const {
    data: tenantsData,
    isLoading: isLoading,
    error: queryError,
  } = useQuery({
    queryKey: [TENANT_QUERY_KEYS.GET_TENANTS],
    queryFn: getTenants,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const { mutateAsync: removeTenant } = useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TENANT_QUERY_KEYS.GET_TENANTS] }),
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete tenant', {
        variant: 'error',
      });
    },
    onSettled: () => resetDeleteState(),
  });

  const tenants = tenantsData?.data ?? [];

  useEffect(() => {
    if (queryError) {
      enqueueSnackbar(queryError?.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [queryError, enqueueSnackbar]);

  const handleConfirmDelete = async (): Promise<void> => {
    if (tenantToDeleteId === null) return;
    await removeTenant(tenantToDeleteId);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Tenant Management
            </Typography>
          }
          action={
            <Button
              variant="contained"
              onClick={openCreateForm}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}>
              + Add Tenant
            </Button>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && (
            <TableContainer>
              <Table stickyHeader aria-label="tenant table">
                <TableHead>
                  <TableRow
                    sx={{
                      '& th': {
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.secondary,
                        fontWeight: 'bold',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                    }}>
                    <TableCell>Tenant Name</TableCell>
                    <TableCell>Alias</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '& tr': {
                      '&:hover': {},
                    },
                    '& td, & th': {
                      color: theme.palette.text.primary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1,
                    },
                    '& tr:last-child td, & tr:last-child th': {
                      borderBottom: 0,
                    },
                  }}>
                  {tenants.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No tenants found.
                      </TableCell>
                    </TableRow>
                  )}
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell component="th" scope="row">
                        {tenant.name}
                      </TableCell>
                      <TableCell>{tenant.alias}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="text"
                          startIcon={<EditIcon />}
                          onClick={() => openEditForm(tenant)}
                          aria-label="edit"
                          size="small"
                          sx={{
                            color: theme.palette.primary.main,
                            textTransform: 'none',
                            mr: 1,
                            '& .MuiButton-startIcon': { mr: 0.5 },
                          }}>
                          Edit
                        </Button>
                        <Button
                          variant="text"
                          startIcon={<DeleteIcon />}
                          onClick={() => openConfirmDeleteDialog(tenant.id)}
                          aria-label="delete"
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            textTransform: 'none',
                            '& .MuiButton-startIcon': { mr: 0.5 },
                          }}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTenant ? 'Edit Tenant' : 'Create Tenant'}</DialogTitle>
        <DialogContent>
          <TenantForm tenant={selectedTenant} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete tenant ID: ${tenantToDeleteId}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default TenantManagementPage;
