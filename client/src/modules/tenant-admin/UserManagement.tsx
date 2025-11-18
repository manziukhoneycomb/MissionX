import React, { useEffect, useState } from 'react';
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
  TextField,
  Tooltip,
  Typography,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../users/types/user';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';
import { ROLES } from '../../common/constants/roles';
import { getRoles } from '../roles/roleQueries';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';
import { ROLE_QUERY_KEYS } from '../roles/roleQueryKeys';
import useTenantId from '../../common/hooks/useTenantId';
import {
  getTenantUsers,
  inviteTenantUser,
  removeTenantUser,
  assignTenantUserRole,
  InviteUserRequest,
  AssignRoleRequest,
} from './tenantAdminQueries';

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

const UserManagement: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const tenantId = useTenantId();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const {
    data: usersData,
    isLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: () => tenantId ? getTenantUsers(tenantId) : Promise.reject(new Error('No tenant ID')),
    enabled: !!tenantId,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const { data: rolesData } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const availableRoles = rolesData?.data?.filter(role => role.name !== ROLES.SUPER_ADMIN) || [];

  useEffect(() => {
    if (usersError) {
      enqueueSnackbar(usersError.message || 'An error occurred while fetching users', {
        variant: 'error',
      });
    }
  }, [usersError, enqueueSnackbar]);

  const users: User[] = usersData?.data ?? [];

  const { mutateAsync: inviteUserMutate, isPending: isInviting } = useMutation({
    mutationFn: (data: InviteUserRequest) => 
      tenantId ? inviteTenantUser(tenantId, data) : Promise.reject(new Error('No tenant ID')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
      enqueueSnackbar('Invitation sent successfully', { variant: 'success' });
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setSelectedRoleIds([]);
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to send invitation', {
        variant: 'error',
      });
    },
  });

  const { mutateAsync: removeUserMutate, isPending: isDeleting } = useMutation({
    mutationFn: (userId: string) => 
      tenantId ? removeTenantUser(tenantId, userId) : Promise.reject(new Error('No tenant ID')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
      enqueueSnackbar('User removed successfully', { variant: 'success' });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to remove user', {
        variant: 'error',
      });
    },
  });

  const { mutateAsync: updateUserRoleMutate, isPending: isUpdatingRole } = useMutation({
    mutationFn: (variables: { userId: string; roleIds: string[] }) =>
      tenantId ? assignTenantUserRole(tenantId, variables.userId, { roleIds: variables.roleIds }) 
                : Promise.reject(new Error('No tenant ID')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
      enqueueSnackbar('User role updated successfully', { variant: 'success' });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to update user role', {
        variant: 'error',
      });
    },
  });

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      enqueueSnackbar('Email is required', { variant: 'error' });
      return;
    }

    if (selectedRoleIds.length === 0) {
      enqueueSnackbar('At least one role must be selected', { variant: 'error' });
      return;
    }

    await inviteUserMutate({
      email: inviteEmail,
      roleIds: selectedRoleIds,
    });
  };

  const handleRemoveUser = async () => {
    if (!userToDelete) return;
    await removeUserMutate(userToDelete);
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser || selectedRoleIds.length === 0) return;
    await updateUserRoleMutate({
      userId: selectedUser.id,
      roleIds: selectedRoleIds,
    });
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (!tenantId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <Typography variant="h6" color="error">
          Unable to load tenant information. Please try refreshing the page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          Tenant Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setIsInviteDialogOpen(true)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          Invite User
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && (
        <TableContainer>
          <Table aria-label="tenant users table">
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
                    No users found in this tenant.
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
                    <Tooltip title="Edit User Role">
                      <IconButton
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedRoleIds(user.roles?.map(r => r.id) || []);
                          setIsEditDialogOpen(true);
                        }}
                        size="small"
                        color="primary"
                        sx={{ mr: 0.5 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove User">
                      <IconButton
                        onClick={() => {
                          setUserToDelete(user.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        size="small"
                        color="error"
                        disabled={isDeleting}
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

      <Dialog
        open={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite User to Tenant</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                multiple
                value={selectedRoleIds}
                label="Role"
                onChange={(e) => setSelectedRoleIds(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                renderValue={(selected) => 
                  availableRoles
                    .filter(role => selected.includes(role.id))
                    .map(role => role.name)
                    .join(', ')
                }
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button 
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setInviteEmail('');
                  setSelectedRoleIds([]);
                }} 
                disabled={isInviting}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleInviteUser}
                disabled={isInviting}
              >
                Send Invitation
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Email"
              value={selectedUser?.email || ''}
              fullWidth
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                multiple
                value={selectedRoleIds}
                label="Role"
                onChange={(e) => setSelectedRoleIds(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                renderValue={(selected) => 
                  availableRoles
                    .filter(role => selected.includes(role.id))
                    .map(role => role.name)
                    .join(', ')
                }
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => setIsEditDialogOpen(false)} disabled={isUpdatingRole}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateUserRole}
                disabled={isUpdatingRole}
              >
                Update Role
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleRemoveUser}
        title="Remove User"
        message="Are you sure you want to remove this user from the tenant? This action cannot be undone."
        confirmText="Remove"
        confirmButtonProps={{ color: 'error', disabled: isDeleting }}
      />
    </Box>
  );
};

export default UserManagement;