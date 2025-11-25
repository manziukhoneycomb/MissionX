import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Autocomplete,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Team } from '../types/team';
import { User } from '../../users/types/user';
import { useUsers } from '../../users/userQueries';
import { useAddTeamMember, useRemoveTeamMember } from '../teamMutations';

interface TeamMembersManagerProps {
  open: boolean;
  onClose: () => void;
  team: Team | null;
}

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({ open, onClose, team }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  if (!team) return null;

  // Filter out users already in the team
  const availableUsers = users.filter(
    (user) => !team.users?.some((member) => member.id === user.id)
  );

  const handleAddMember = () => {
    if (selectedUser) {
      addMemberMutation.mutate(
        { teamId: team.id, userId: selectedUser.id },
        {
          onSuccess: () => {
            setSelectedUser(null);
          },
        }
      );
    }
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate({ teamId: team.id, userId });
  };

  const isLoading = addMemberMutation.isPending || removeMemberMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Members - {team.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add Member
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              options={availableUsers}
              getOptionLabel={(option) => 
                `${option.firstName || ''} ${option.lastName || ''} (${option.email})`.trim()
              }
              value={selectedUser}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              loading={isLoadingUsers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  placeholder="Search by name or email"
                  size="small"
                />
              )}
            />
            <Button
              variant="contained"
              onClick={handleAddMember}
              disabled={!selectedUser || isLoading}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Current Members ({team.users?.length || 0})
        </Typography>
        <List dense sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {team.users?.length === 0 ? (
            <ListItem>
              <ListItemText primary="No members in this team" sx={{ color: 'text.secondary' }} />
            </ListItem>
          ) : (
            team.users?.map((user) => (
              <ListItem key={user.id}>
                <ListItemText
                  primary={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Name'}
                  secondary={user.email}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveMember(user.id)}
                    disabled={isLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersManager;
