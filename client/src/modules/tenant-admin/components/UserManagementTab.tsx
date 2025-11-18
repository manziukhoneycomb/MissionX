import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../../users/types/user';
import { useTenantAdminStore } from '../stores/tenantAdminStore';
import { getTenantUsers } from '../queries/tenantAdminQueries';
import { inviteUserToTenant, updateTenantUser, removeUserFromTenant } from '../mutations/tenantAdminMutations';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import TenantUserForm from './TenantUserForm';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { useUser } from '@clerk/clerk-react';

const formatRoles = (roles: User['roles']): React.ReactNode => {
  if (!roles || roles.length === 0) {
    return '-';
  }
  return (
    <Stack direction="row" spacing={1}>
      {roles.map((role) => (
        <Chip key={role.id} label={role.name} size="small" />
      ))}
    </Stack>
  );
};

const UserManagementTab: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const userRoles = useUserRoles();
  
  // Get current user's tenant ID from Clerk
  const currentTenantId = clerkUser?.publicMetadata?.tenantId as string;

  const {
    isUserFormOpen,
    selectedUser,
    isConfirmDeleteDialogOpen,
    userToDeleteId,
    openCreateUserForm,
    openEditUserForm,
    closeUserForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
  } = useTenantAdminStore();

  const {
    data: usersData,
    isLoading,
    error: usersError,
    refetch,
  } = useQuery({
    queryKey: ['tenant-users', currentTenantId],
    queryFn: () => getTenantUsers(currentTenantId),
    enabled: !!currentTenantId,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (usersError) {
      enqueueSnackbar(usersError.message || 'An error occurred while fetching tenant users', {
        variant: 'error',
      });
    }
  }, [usersError, enqueueSnackbar]);

  const users: User[] = usersData ?? [];

  const { mutateAsync: inviteUserMutate, isPending: isInviting } = useMutation({
    mutationFn: (userData: any) => inviteUserToTenant(currentTenantId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', currentTenantId] });
      closeUserForm();
      enqueueSnackbar('User invitation sent successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to invite user', { variant: 'error' });
    },
  });

  const { mutateAsync: updateUserMutate, isPending: isUpdating } = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: any }) =>
      updateTenantUser(currentTenantId, userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', currentTenantId] });
      closeUserForm();
      enqueueSnackbar('User updated successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to update user', { variant: 'error' });
    },
  });

  const { mutateAsync: removeUserMutate, isPending: isRemoving } = useMutation({
    mutationFn: (userId: string) => removeUserFromTenant(currentTenantId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', currentTenantId] });
      resetDeleteState();
      enqueueSnackbar('User removed successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to remove user', { variant: 'error' });
      resetDeleteState();
    },
  });

  const handleConfirmDelete = async (): Promise<void> => {
    if (userToDeleteId === null) return;
    await removeUserMutate(userToDeleteId);
  };

  const handleInviteUser = async (userData: any): Promise<void> => {
    await inviteUserMutate(userData);
  };

  const handleUpdateUser = async (userData: any): Promise<void> => {
    if (!selectedUser) return;
    await updateUserMutate({ userId: selectedUser.id, userData });
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (!currentTenantId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Unable to determine tenant context. Please contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title={
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Tenant User Management
            </Typography>
          }
          subheader="Manage users within your tenant"
          action={
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={openCreateUserForm}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Invite User
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
              <Table stickyHeader aria-label="tenant users table">
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
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '& tr': {
                      '&:hover': { backgroundColor: theme.palette.action.hover },
                    },
                    '& td, & th': {
                      color: theme.palette.text.primary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1,
                    },
                    '& tr:last-child td, & tr:last-child th': {
                      borderBottom: 0,
                    },
                  }}
                >
                  {users.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No users in this tenant
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Invite users to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell component="th" scope="row">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {`${user.firstName ?? '-'} ${user.lastName ?? ''}`.trim()}
                      </TableCell>
                      <TableCell>{formatRoles(user.roles)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isActive ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />}
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit User">
                          <IconButton
                            onClick={() => openEditUserForm(user)}
                            size="small"
                            color="primary"
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove User">
                          <IconButton
                            onClick={() => openConfirmDeleteDialog(user.id)}
                            size="small"
                            color="error"
                            disabled={isRemoving && userToDeleteId === user.id}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isUserFormOpen}
        onClose={closeUserForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          {selectedUser ? 'Edit User' : 'Invite User to Tenant'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TenantUserForm
            user={selectedUser}
            onSubmit={selectedUser ? handleUpdateUser : handleInviteUser}
            onClose={closeUserForm}
            isLoading={isInviting || isUpdating}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Remove User from Tenant"
        message={`Are you sure you want to remove this user from the tenant? This action cannot be undone.`}
        confirmText="Remove"
        confirmButtonProps={{ color: 'error', disabled: isRemoving }}
      />
    </Box>
  );
};

export default UserManagementTab;