import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  SelectChangeEvent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { User } from '../../../modules/users/types/user';
import { useUserInvitation } from '../../../hooks/use-user-invitation';
import { ROLES } from '../../../common/constants/roles';
import RoleChip from './role-chip';

interface RoleSelectorProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onRoleUpdated: () => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  open,
  onClose,
  user,
  onRoleUpdated,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { assignRoles } = useUserInvitation();
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.roles?.map(role => role.name) || []
  );

  const { mutate: assignRolesMutate, isPending } = useMutation({
    mutationFn: () => assignRoles.mutateAsync({
      userId: user.id,
      roleNames: selectedRoles,
    }),
    onSuccess: () => {
      enqueueSnackbar('User roles updated successfully', { variant: 'success' });
      onRoleUpdated();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update user roles', { variant: 'error' });
    },
  });

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSave = () => {
    assignRolesMutate();
  };

  const handleCancel = () => {
    setSelectedRoles(user.roles?.map(role => role.name) || []);
    onClose();
  };

  const availableRoles = [ROLES.ADMIN, ROLES.USER];
  const hasChanges = JSON.stringify(selectedRoles.sort()) !== 
                    JSON.stringify((user.roles?.map(role => role.name) || []).sort());

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          color: 'text.primary',
        },
      }}>
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
        Manage Roles for {user.email}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the roles you want to assign to this user within your tenant.
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current Roles:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role) => (
                <RoleChip key={role.id} role={role} />
              ))
            ) : (
              <Chip label="No roles assigned" size="small" variant="outlined" />
            )}
          </Box>
        </Box>

        <FormControl fullWidth>
          <InputLabel id="roles-select-label">Select Roles</InputLabel>
          <Select
            labelId="roles-select-label"
            id="roles-select"
            multiple
            value={selectedRoles}
            onChange={handleRoleChange}
            input={<OutlinedInput id="select-multiple-chip" label="Select Roles" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}>
            {availableRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isPending || !hasChanges}
          startIcon={isPending ? <CircularProgress size={20} /> : null}>
          {isPending ? 'Updating...' : 'Update Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleSelector;