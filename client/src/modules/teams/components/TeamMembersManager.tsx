import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Team, AddTeamMemberInput } from '../types/team';
import { useAddTeamMember, useRemoveTeamMember } from '../teamMutations';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../users/userQueries';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';

type TeamMembersManagerProps = {
  team: Team;
  open: boolean;
  onClose: () => void;
};

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({ team, open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: allUsersData, isLoading: usersLoading } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    enabled: open,
  });

  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const allUsers = allUsersData?.data ?? [];
  const currentMemberIds = team.users.map(user => user.id);
  const availableUsers = allUsers.filter(user => 
    user.isActive && !currentMemberIds.includes(user.id)
  );

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      const memberData: AddTeamMemberInput = { userId: selectedUserId };
      await addMemberMutation.mutateAsync({ teamId: team.id, memberData });
      
      enqueueSnackbar('User added to team successfully', { variant: 'success' });
      setSelectedUserId('');
      setShowAddForm(false);
    } catch (error) {
      enqueueSnackbar('Failed to add user to team', { variant: 'error' });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ teamId: team.id, userId });
      enqueueSnackbar('User removed from team successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to remove user from team', { variant: 'error' });
    }
  };

  const getUserDisplayName = (user: { firstName?: string; lastName?: string; email: string }) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  const getUserInitials = (user: { firstName?: string; lastName?: string; email: string }) => {
    if (user.firstName || user.lastName) {
      const first = user.firstName?.[0] || '';
      const last = user.lastName?.[0] || '';
      return `${first}${last}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const isSubmitting = addMemberMutation.isPending || removeMemberMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Manage Team Members - {team.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Current Members */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Members ({team.users.length})
            </Typography>
            {team.users.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No members in this team yet.
              </Typography>
            ) : (
              <List>
                {team.users.map((user) => (
                  <ListItem key={user.id} divider>
                    <Avatar sx={{ mr: 2 }}>
                      {getUserInitials(user)}
                    </Avatar>
                    <ListItemText
                      primary={getUserDisplayName(user)}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          {user.roles.map((role) => (
                            <Chip 
                              key={role.id} 
                              label={role.name} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemoveMember(user.id)}
                        disabled={isSubmitting}
                        color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Add Member Section */}
          <Box>
            {!showAddForm ? (
              <Button
                startIcon={<PersonAddIcon />}
                variant="outlined"
                onClick={() => setShowAddForm(true)}
                disabled={availableUsers.length === 0 || usersLoading}>
                Add Member
              </Button>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6">Add New Member</Typography>
                
                {usersLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <FormControl fullWidth>
                    <InputLabel>Select User</InputLabel>
                    <Select
                      value={selectedUserId}
                      label="Select User"
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      disabled={isSubmitting}>
                      {availableUsers.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {getUserDisplayName(user)} ({user.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedUserId('');
                    }}
                    disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddMember}
                    disabled={!selectedUserId || isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add Member'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersManager;