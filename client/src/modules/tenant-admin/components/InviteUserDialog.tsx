import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Box,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getRoles } from '../../roles/roleQueries';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { ROLES } from '../../../common/constants/roles';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (inviteData: { email: string; roleIds: string[] }) => Promise<void>;
  isLoading: boolean;
}

const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onClose,
  onInvite,
  isLoading,
}) => {
  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const availableRoles = rolesData?.data?.filter(role => 
    role.name !== ROLES.SUPER_ADMIN
  ) ?? [];

  useEffect(() => {
    if (!open) {
      setEmail('');
      setSelectedRoleIds([]);
      setEmailError('');
    }
  }, [open]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedRoleIds(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (selectedRoleIds.length === 0) {
      return;
    }

    try {
      await onInvite({ email, roleIds: selectedRoleIds });
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  const isFormValid = email.trim() !== '' && validateEmail(email) && selectedRoleIds.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
        },
      }}>
      <DialogTitle>Invite User to Tenant</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError || 'Enter the email address of the user to invite'}
            sx={{ mb: 3 }}
            disabled={isLoading}
          />
          
          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={selectedRoleIds}
              onChange={handleRoleChange}
              input={<OutlinedInput label="Roles" />}
              disabled={isLoading}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((roleId) => {
                    const role = availableRoles.find(r => r.id === roleId);
                    return (
                      <Chip
                        key={roleId}
                        label={role?.name || roleId}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}>
              {availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}>
          {isLoading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteUserDialog;