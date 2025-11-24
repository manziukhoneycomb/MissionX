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
  Typography,
  Box,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../../users/types/user';
import { useAddTeamMember, useRemoveTeamMember } from '../teamMutations';
import { useTeam } from '../teamQueries';
import { useUsers } from '../../users/userQueries';

interface TeamMembersManagerProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({
  open,
  onClose,
  teamId,
  teamName,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch team details to get current members
  const { data: team, isLoading: isLoadingTeam } = useTeam(teamId);

  // Fetch all users to populate the autocomplete
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();

  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const handleAddMember = () => {
    if (selectedUser) {
      addMemberMutation.mutate(
        { teamId, userId: selectedUser.id },
        {
          onSuccess: () => {
            setSelectedUser(null);
          },
        },
      );
    }
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate({ teamId, userId });
  };

  // Filter out users who are already in the team
  const currentMemberIds = team?.users?.map((u) => u.id) || [];
  const availableUsers = users.filter((user: User) => !currentMemberIds.includes(user.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Members - {teamName}</DialogTitle>
      <DialogContent>
        {isLoadingTeam ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3, mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add Member
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Autocomplete
                  options={availableUsers}
                  getOptionLabel={(option) =>
                    `${option.firstName || ''} ${option.lastName || ''} (${option.email})`.trim()
                  }
                  value={selectedUser}
                  onChange={(_, newValue) => setSelectedUser(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select User"
                      placeholder="Search by name or email"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {isLoadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  fullWidth
                  loading={isLoadingUsers}
                />
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disabled={!selectedUser || addMemberMutation.isPending}>
                  Add
                </Button>
              </Box>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Current Members ({team?.users?.length || 0})
            </Typography>
            <List dense>
              {team?.users?.map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemText
                    primary={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                    secondary={user.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveMember(user.id)}
                      disabled={removeMemberMutation.isPending}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {(!team?.users || team.users.length === 0) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2, textAlign: 'center' }}>
                  No members in this team yet.
                </Typography>
              )}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersManager;
