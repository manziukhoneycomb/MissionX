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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
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
import CancelIcon from '@mui/icons-material/Cancel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../../users/types/user';
import { Invitation } from '../types/invitation';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { getUsers } from '../../users/userQueries';
import { deleteUser, activateUser, deactivateUser } from '../../users/userMutations';
import { getInvitations, inviteUser, resendInvitation, cancelInvitation } from '../tenantAdminQueries';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';
import InviteUserDialog from './InviteUserDialog';
import { useTenantAdminStore } from '../stores/tenantAdminStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-management-tabpanel-${index}`}
      aria-labelledby={`user-management-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

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

const formatInvitationRoles = (roles: Invitation['roles']): React.ReactNode => {
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

const UserManagement: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const {
    isInviteDialogOpen,
    isConfirmDeleteDialogOpen,
    userToDeleteId,
    isConfirmToggleStatusDialogOpen,
    userToToggleStatus,
    isConfirmCancelInviteDialogOpen,
    invitationToCancelId,
    openInviteDialog,
    closeInviteDialog,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openConfirmToggleStatusDialog,
    closeConfirmToggleStatusDialog,
    resetToggleStatusState,
    openConfirmCancelInviteDialog,
    closeConfirmCancelInviteDialog,
    resetCancelInviteState,
  } = useTenantAdminStore();

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const {
    data: invitationsData,
    isLoading: isLoadingInvitations,
    error: invitationsError,
  } = useQuery({
    queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_INVITATIONS],
    queryFn: getInvitations,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (usersError) {
      enqueueSnackbar(usersError.message || 'An error occurred while fetching users', {
        variant: 'error',
      });
    }
  }, [usersError, enqueueSnackbar]);

  useEffect(() => {
    if (invitationsError) {
      enqueueSnackbar(invitationsError.message || 'An error occurred while fetching invitations', {
        variant: 'error',
      });
    }
  }, [invitationsError, enqueueSnackbar]);

  const users: User[] = usersData?.data ?? [];
  const invitations: Invitation[] = invitationsData?.data ?? [];

  const { mutateAsync: removeUserMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USERS] });
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to delete user', { variant: 'error' });
    },
    onSettled: () => resetDeleteState(),
  });

  const { mutateAsync: toggleUserStatusMutate, isPending: isTogglingStatus } = useMutation({
    mutationFn: (variables: { id: string; activate: boolean }) =>
      variables.activate ? activateUser(variables.id) : deactivateUser(variables.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.GET_USERS] });
      enqueueSnackbar(
        `User ${variables.activate ? 'activated' : 'deactivated'} successfully`,
        { variant: 'success' }
      );
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to update user status', { variant: 'error' });
    },
    onSettled: () => resetToggleStatusState(),
  });

  const { mutateAsync: resendInvitationMutate, isPending: isResending } = useMutation({
    mutationFn: resendInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_INVITATIONS] });
      enqueueSnackbar('Invitation resent successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to resend invitation', { variant: 'error' });
    },
  });

  const { mutateAsync: cancelInvitationMutate, isPending: isCancelling } = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_INVITATIONS] });
      enqueueSnackbar('Invitation cancelled successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to cancel invitation', { variant: 'error' });
    },
    onSettled: () => resetCancelInviteState(),
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (userToDeleteId === null) return;
    await removeUserMutate(userToDeleteId);
  };

  const handleConfirmToggleStatus = async (): Promise<void> => {
    if (!userToToggleStatus) return;
    const activate = !userToToggleStatus.isActive;
    await toggleUserStatusMutate({ id: userToToggleStatus.id, activate });
  };

  const handleConfirmCancelInvitation = async (): Promise<void> => {
    if (invitationToCancelId === null) return;
    await cancelInvitationMutate(invitationToCancelId);
  };

  const handleResendInvitation = async (invitationId: string): Promise<void> => {
    await resendInvitationMutate(invitationId);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              User Management
            </Typography>
          }
          action={
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={openInviteDialog}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Invite User
            </Button>
          }
        />
        
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
              <Tab label={`Active Users (${users.length})`} />
              <Tab label={`Pending Invitations (${invitations.length})`} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {isLoadingUsers && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress />
              </Box>
            )}
            
            {!isLoadingUsers && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.text.secondary,
                          fontWeight: 'bold',
                        },
                      }}
                    >
                      <TableCell>Email</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Roles</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
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
                              disabled={isTogglingStatus && userToToggleStatus?.id === user.id}
                            >
                              {user.isActive ? <HighlightOffIcon /> : <CheckCircleOutlineIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              onClick={() => openConfirmDeleteDialog(user.id)}
                              size="small"
                              color="error"
                              disabled={isDeleting && userToDeleteId === user.id}
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
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {isLoadingInvitations && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress />
              </Box>
            )}
            
            {!isLoadingInvitations && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.text.secondary,
                          fontWeight: 'bold',
                        },
                      }}
                    >
                      <TableCell>Email</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Roles</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Invited By</TableCell>
                      <TableCell>Expires At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invitations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          No pending invitations found.
                        </TableCell>
                      </TableRow>
                    )}
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          {`${invitation.firstName ?? '-'} ${invitation.lastName ?? ''}`.trim()}
                        </TableCell>
                        <TableCell>{formatInvitationRoles(invitation.roles)}</TableCell>
                        <TableCell>
                          <Chip
                            label={invitation.status}
                            color={getStatusColor(invitation.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{invitation.invitedBy}</TableCell>
                        <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                        <TableCell align="right">
                          {invitation.status === 'pending' && (
                            <>
                              <Tooltip title="Resend Invitation">
                                <IconButton
                                  onClick={() => handleResendInvitation(invitation.id)}
                                  size="small"
                                  color="primary"
                                  disabled={isResending}
                                >
                                  <EmailIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel Invitation">
                                <IconButton
                                  onClick={() => openConfirmCancelInviteDialog(invitation.id)}
                                  size="small"
                                  color="error"
                                  disabled={isCancelling && invitationToCancelId === invitation.id}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      <InviteUserDialog 
        open={isInviteDialogOpen}
        onClose={closeInviteDialog}
      />

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user #${userToDeleteId}? This action cannot be undone.`}
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

      <ConfirmationDialog
        open={isConfirmCancelInviteDialogOpen}
        onClose={closeConfirmCancelInviteDialog}
        onConfirm={handleConfirmCancelInvitation}
        title="Cancel Invitation"
        message={`Are you sure you want to cancel invitation #${invitationToCancelId}? This action cannot be undone.`}
        confirmText="Cancel Invitation"
        confirmButtonProps={{ color: 'error', disabled: isCancelling }}
      />
    </Box>
  );
};

export default UserManagement;