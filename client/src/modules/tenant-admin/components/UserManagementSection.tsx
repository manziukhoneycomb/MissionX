import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EmailIcon from '@mui/icons-material/Email';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../../users/types/user';
import UserForm from '../../users/components/UserForm';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { getTenantUsers } from '../tenantAdminQueries';
import { deleteUser, activateUser, deactivateUser, inviteUser } from '../tenantAdminMutations';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { useTenantAdminStore } from '../stores/tenantAdminStore';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';
import InviteUserDialog from './InviteUserDialog';

type UserManagementSectionProps = Record<string, unknown>;

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

const UserManagementSection: React.FC<UserManagementSectionProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const {
    isFormOpen,
    selectedUser,
    isConfirmDeleteDialogOpen,
    userToDeleteId,
    isConfirmToggleStatusDialogOpen,
    userToToggleStatus,
    isInviteDialogOpen,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openConfirmToggleStatusDialog,
    closeConfirmToggleStatusDialog,
    resetToggleStatusState,
    openInviteDialog,
    closeInviteDialog,
  } = useTenantAdminStore();

  const {
    data: usersData,
    isLoading,
    error: usersError,
  } = useQuery({
    queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_TENANT_USERS],
    queryFn: getTenantUsers,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (usersError) {
      enqueueSnackbar(usersError.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [usersError, enqueueSnackbar]);

  const users: User[] = usersData?.data ?? [];

  const { mutateAsync: removeUserMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_TENANT_USERS] });
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to delete user', {
        variant: 'error',
      });
    },
    onSettled: () => resetDeleteState(),
  });

  const { mutateAsync: toggleUserStatusMutate, isPending: isTogglingStatus } = useMutation({
    mutationFn: (variables: { id: string; activate: boolean }) =>
      variables.activate ? activateUser(variables.id) : deactivateUser(variables.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_TENANT_USERS] });
      enqueueSnackbar(
        `User ${variables.activate ? 'activated' : 'deactivated'} successfully`, 
        { variant: 'success' }
      );
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to update user status', {
        variant: 'error',
      });
    },
    onSettled: () => resetToggleStatusState(),
  });

  const { mutateAsync: inviteUserMutate, isPending: isInviting } = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_TENANT_USERS] });
      enqueueSnackbar('User invitation sent successfully', { variant: 'success' });
      closeInviteDialog();
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to send invitation', {
        variant: 'error',
      });
    },
  });

  const handleConfirmDelete = async (): Promise<void> => {
    if (userToDeleteId === null) return;
    await removeUserMutate(userToDeleteId);
  };

  const handleConfirmToggleStatus = async (): Promise<void> => {
    if (!userToToggleStatus) return;
    const activate = !userToToggleStatus.isActive;
    await toggleUserStatusMutate({ id: userToToggleStatus.id, activate });
  };

  const handleInviteUser = async (inviteData: { email: string; roleIds: string[] }): Promise<void> => {
    await inviteUserMutate(inviteData);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Tenant Users
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={openInviteDialog}
            sx={{
              textTransform: 'none',
            }}>
            Invite User
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={openCreateForm}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            }}>
            Add User
          </Button>
        </Box>
      </Box>

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
                }}>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                  py: 1,
                },
                '& tr:last-child td, & tr:last-child th': {
                  borderBottom: 0,
                },
              }}>
              {users.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No users found in your tenant.
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
                    <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                      <IconButton
                        onClick={() => openConfirmToggleStatusDialog(user)}
                        size="small"
                        color={user.isActive ? 'warning' : 'success'}
                        sx={{ mr: 0.5 }}
                        disabled={isTogglingStatus && userToToggleStatus?.id === user.id}>
                        {user.isActive ? <HighlightOffIcon /> : <CheckCircleOutlineIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                      <IconButton
                        onClick={() => openEditForm(user)}
                        size="small"
                        color="primary"
                        sx={{ mr: 0.5 }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton
                        onClick={() => openConfirmDeleteDialog(user.id)}
                        size="small"
                        color="error"
                        disabled={isDeleting && userToDeleteId === user.id}>
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

      <Dialog
        open={isFormOpen}
        onClose={closeForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <UserForm user={selectedUser} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <InviteUserDialog
        open={isInviteDialogOpen}
        onClose={closeInviteDialog}
        onInvite={handleInviteUser}
        isLoading={isInviting}
      />

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete this user? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error', disabled: isDeleting }}
      />

      <ConfirmationDialog
        open={isConfirmToggleStatusDialogOpen}
        onClose={closeConfirmToggleStatusDialog}
        onConfirm={handleConfirmToggleStatus}
        title={userToToggleStatus?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${userToToggleStatus?.isActive ? 'deactivate' : 'activate'} user ${userToToggleStatus?.email ?? ''}?`}
        confirmText={userToToggleStatus?.isActive ? 'Deactivate' : 'Activate'}
        confirmButtonProps={{
          color: userToToggleStatus?.isActive ? 'warning' : 'success',
          disabled: isTogglingStatus,
        }}
      />
    </Box>
  );
};

export default UserManagementSection;