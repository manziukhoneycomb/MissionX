import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Stack,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles } from '../../roles/roleQueries';
import { inviteUser } from '../tenantAdminQueries';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';
import { ROLE_QUERY_KEYS } from '../../roles/roleQueryKeys';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
}

const InviteUserDialog: React.FC<InviteUserDialogProps> = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    email?: string;
    roleIds?: string;
  }>({});

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.LONG,
  });

  const { mutateAsync: inviteUserMutate, isPending: isInviting } = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_INVITATIONS] });
      enqueueSnackbar('User invitation sent successfully', { variant: 'success' });
      handleClose();
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to invite user', { variant: 'error' });
    },
  });

  const roles = rolesData?.data ?? [];

  useEffect(() => {
    if (!open) {
      setEmail('');
      setFirstName('');
      setLastName('');
      setSelectedRoleIds([]);
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (selectedRoleIds.length === 0) {
      newErrors.roleIds = 'At least one role must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (!isInviting) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await inviteUserMutate({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        roleIds: selectedRoleIds,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedRoleIds(typeof value === 'string' ? value.split(',') : value);
    
    // Clear role error when user selects roles
    if (errors.roleIds && (typeof value === 'string' ? value.split(',') : value).length > 0) {
      setErrors(prev => ({ ...prev, roleIds: undefined }));
    }
  };

  const getSelectedRoleNames = () => {
    return roles
      .filter(role => selectedRoleIds.includes(role.id))
      .map(role => role.name);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    // Clear email error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite User</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
            disabled={isInviting}
          />
          
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            disabled={isInviting}
          />
          
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            disabled={isInviting}
          />

          <FormControl fullWidth error={!!errors.roleIds} disabled={isInviting}>
            <InputLabel>Roles *</InputLabel>
            <Select
              multiple
              value={selectedRoleIds}
              onChange={handleRoleChange}
              label="Roles *"
              renderValue={() => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {getSelectedRoleNames().map((name) => (
                    <Chip key={name} label={name} size="small" />
                  ))}
                </Box>
              )}
            >
              {isLoadingRoles ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                  Loading roles...
                </MenuItem>
              ) : (
                roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.roleIds && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                {errors.roleIds}
              </Box>
            )}
          </FormControl>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isInviting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isInviting || isLoadingRoles}
        >
          {isInviting ? <CircularProgress size={20} /> : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteUserDialog;