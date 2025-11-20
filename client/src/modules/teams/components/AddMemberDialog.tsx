import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../users/userQueries';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { TeamRole } from '../types/team';
import { User } from '../../users/types/user';
import { useAddTeamMember } from '../hooks/useTeamMutations';

interface AddMemberDialogProps {
  open: boolean;
  teamId: string | null;
  onClose: () => void;
  existingMemberIds?: string[];
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  teamId,
  onClose,
  existingMemberIds = [],
}) => {
  const theme = useTheme();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('MEMBER');

  const addMemberMutation = useAddTeamMember();

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    enabled: open,
  });

  const availableUsers = (usersData?.data || []).filter(
    (user: User) => !existingMemberIds.includes(user.id)
  );

  const handleUserChange = (event: SelectChangeEvent<string>) => {
    setSelectedUserId(event.target.value);
  };

  const handleRoleChange = (event: SelectChangeEvent<TeamRole>) => {
    setSelectedRole(event.target.value as TeamRole);
  };

  const handleSubmit = async () => {
    if (!teamId || !selectedUserId) return;

    try {
      await addMemberMutation.mutateAsync({
        teamId,
        data: {
          userId: selectedUserId,
          teamRole: selectedRole,
        },
      });
      handleClose();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Add member error:', error);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSelectedRole('MEMBER');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        Add Team Member
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUserId}
              onChange={handleUserChange}
              label="Select User"
              disabled={isLoadingUsers}
              sx={{
                color: theme.palette.text.primary,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }}>
              {isLoadingUsers && (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading users...
                </MenuItem>
              )}
              {!isLoadingUsers && availableUsers.length === 0 && (
                <MenuItem disabled>No users available</MenuItem>
              )}
              {!isLoadingUsers &&
                availableUsers.map((user: User) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName} (${user.email})`
                      : user.email}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Team Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={handleRoleChange}
              label="Team Role"
              sx={{
                color: theme.palette.text.primary,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }}>
              <MenuItem value="MEMBER">Member</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="OWNER">Owner</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={handleClose}
          disabled={addMemberMutation.isPending}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedUserId || addMemberMutation.isPending}
          startIcon={addMemberMutation.isPending ? <CircularProgress size={18} /> : null}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}>
          {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;