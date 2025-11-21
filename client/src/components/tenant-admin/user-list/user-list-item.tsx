import React, { useState } from 'react';
import {
  TableRow,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { User } from '../../../modules/users/types/user';
import { useUserInvitation } from '../../../hooks/use-user-invitation';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import RoleSelector from '../role-assignment/role-selector';
import { StyledTableCell } from './user-list.styles';

interface UserListItemProps {
  user: User;
  onUserUpdated: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onUserUpdated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmStatusToggleOpen, setConfirmStatusToggleOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const { removeUser, toggleUserStatus } = useUserInvitation();

  const { mutate: deleteUserMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => removeUser.mutateAsync(user.id),
    onSuccess: () => {
      enqueueSnackbar('User removed successfully', { variant: 'success' });
      onUserUpdated();
      setConfirmDeleteOpen(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to remove user', { variant: 'error' });
    },
  });

  const { mutate: toggleStatusMutate, isPending: isTogglingStatus } = useMutation({
    mutationFn: async () => {
      await toggleUserStatus.mutateAsync({ userId: user.id, activate: !user.isActive });
    },
    onSuccess: () => {
      enqueueSnackbar(
        `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
        { variant: 'success' }
      );
      onUserUpdated();
      setConfirmStatusToggleOpen(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update user status', { variant: 'error' });
    },
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatRoles = (roles: User['roles']): React.ReactNode => {
    if (!roles || roles.length === 0) {
      return <Chip label="No Role" size="small" variant="outlined" />;
    }
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {roles.map((role) => (
          <Chip key={role.id} label={role.name} size="small" color="primary" />
        ))}
      </Stack>
    );
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatName = (user: User): string => {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '-';
  };

  return (
    <>
      <TableRow>
        <StyledTableCell component="th" scope="row">
          {user.email}
        </StyledTableCell>
        <StyledTableCell>{formatName(user)}</StyledTableCell>
        <StyledTableCell>{formatRoles(user.roles)}</StyledTableCell>
        <StyledTableCell>
          <Chip
            icon={user.isActive ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />}
            label={user.isActive ? 'Active' : 'Inactive'}
            color={user.isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
        </StyledTableCell>
        <StyledTableCell>{formatDate(user.createdAt)}</StyledTableCell>
        <StyledTableCell align="right">
          <Tooltip title="Actions">
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </StyledTableCell>
      </TableRow>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <MenuItem
          onClick={() => {
            setRoleDialogOpen(true);
            handleMenuClose();
          }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Roles
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmStatusToggleOpen(true);
            handleMenuClose();
          }}
          disabled={isTogglingStatus}>
          {user.isActive ? <HighlightOffIcon sx={{ mr: 1 }} /> : <CheckCircleOutlineIcon sx={{ mr: 1 }} />}
          {user.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmDeleteOpen(true);
            handleMenuClose();
          }}
          disabled={isDeleting}
          sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Remove User
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => deleteUserMutate()}
        title="Remove User"
        message={`Are you sure you want to remove ${user.email} from this tenant? This action cannot be undone.`}
        confirmText="Remove"
        confirmButtonProps={{ color: 'error', disabled: isDeleting }}
      />

      <ConfirmationDialog
        open={confirmStatusToggleOpen}
        onClose={() => setConfirmStatusToggleOpen(false)}
        onConfirm={() => toggleStatusMutate()}
        title={user.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.email}?`}
        confirmText={user.isActive ? 'Deactivate' : 'Activate'}
        confirmButtonProps={{
          color: user.isActive ? 'warning' : 'success',
          disabled: isTogglingStatus,
        }}
      />

      <RoleSelector
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        user={user}
        onRoleUpdated={() => {
          onUserUpdated();
          setRoleDialogOpen(false);
        }}
      />
    </>
  );
};

export default UserListItem;