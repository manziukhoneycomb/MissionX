import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Autocomplete,
  TextField,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Team, TeamMember } from '../types/team';
import { User } from '../../users/types/user';
import { useGetTeamUsers } from '../teamQueries';
import { useGetUsers } from '../../users/userQueries';
import { useAddUsersToTeam, useRemoveUsersFromTeam } from '../teamMutations';

type TeamMembersDialogProps = {
  open: boolean;
  team: Team;
  onClose: () => void;
};

const TeamMembersDialog: React.FC<TeamMembersDialogProps> = ({ open, team, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: teamMembers = [], isLoading: isLoadingMembers } = useGetTeamUsers(team.id);
  const { data: allUsers = [], isLoading: isLoadingUsers } = useGetUsers();

  const addUsersMutation = useAddUsersToTeam();
  const removeUsersMutation = useRemoveUsersFromTeam();

  const isLoading = isLoadingMembers || isLoadingUsers || 
    addUsersMutation.isPending || removeUsersMutation.isPending;

  const teamMemberIds = new Set(teamMembers.map(member => member.id));
  const availableUsers = allUsers.filter(user => 
    !teamMemberIds.has(user.id) && user.tenant.id === team.tenantId
  );

  const handleAddUsers = async (): Promise<void> => {
    if (selectedUsers.length === 0) return;

    try {
      await addUsersMutation.mutateAsync({
        teamId: team.id,
        data: { userIds: selectedUsers.map(user => user.id) },
      });
      setSelectedUsers([]);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleRemoveUser = async (userId: string): Promise<void> => {
    try {
      await removeUsersMutation.mutateAsync({
        teamId: team.id,
        data: { userIds: [userId] },
      });
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Team Members - {team.name}
      </DialogTitle>
      <DialogContent>
        {isLoadingMembers ? (
          <Box display="flex" justifyContent="center" padding={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Add Members
              </Typography>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Autocomplete
                  multiple
                  options={availableUsers}
                  value={selectedUsers}
                  onChange={(_, newValue) => setSelectedUsers(newValue)}
                  getOptionLabel={(option) => 
                    `${option.email}${option.firstName || option.lastName ? 
                      ` (${[option.firstName, option.lastName].filter(Boolean).join(' ')})` : ''}`
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.email}
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select users to add"
                      size="small"
                    />
                  )}
                  sx={{ flex: 1 }}
                  disabled={isLoading}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddUsers}
                  disabled={selectedUsers.length === 0 || isLoading}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Current Members ({teamMembers.length})
              </Typography>
              {teamMembers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" py={2}>
                  No members in this team yet
                </Typography>
              ) : (
                <List>
                  {teamMembers.map((member: TeamMember) => (
                    <ListItem key={member.id} divider>
                      <ListItemText
                        primary={member.email}
                        secondary={
                          member.firstName || member.lastName
                            ? `${[member.firstName, member.lastName].filter(Boolean).join(' ')}`
                            : undefined
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={member.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={member.isActive ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <IconButton
                          edge="end"
                          aria-label="remove"
                          onClick={() => handleRemoveUser(member.id)}
                          disabled={isLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersDialog;