import React, { useState, useMemo } from 'react';
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
  Divider,
  Typography,
  Box,
  Chip,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { useGetUsers } from '../../users/userQueries';
import { useAddUsersToTeam, useRemoveUsersFromTeam } from '../teamMutations';
import { User } from '../../users/types/user';

export const TeamMembersDialog: React.FC = () => {
  const { isMembersDialogOpen, selectedTeamForMembers, closeMembersDialog } = useTeamManagementStore();
  const { data: allUsers, isLoading: isLoadingUsers } = useGetUsers();
  const addUsersMutation = useAddUsersToTeam();
  const removeUsersMutation = useRemoveUsersFromTeam();
  
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const availableUsers = useMemo(() => {
    if (!allUsers || !selectedTeamForMembers) return [];
    
    const teamUserIds = selectedTeamForMembers.users.map(u => u.id);
    return allUsers.filter(user => 
      !teamUserIds.includes(user.id) &&
      user.tenant.id === selectedTeamForMembers.tenant.id
    );
  }, [allUsers, selectedTeamForMembers]);

  const handleAddUsers = async () => {
    if (!selectedTeamForMembers || selectedUsers.length === 0) return;
    
    try {
      await addUsersMutation.mutateAsync({
        teamId: selectedTeamForMembers.id,
        data: { userIds: selectedUsers.map(u => u.id) }
      });
      setSelectedUsers([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedTeamForMembers) return;
    
    try {
      await removeUsersMutation.mutateAsync({
        teamId: selectedTeamForMembers.id,
        data: { userIds: [userId] }
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!selectedTeamForMembers) return null;

  return (
    <Dialog 
      open={isMembersDialogOpen} 
      onClose={closeMembersDialog} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>Manage Team Members - {selectedTeamForMembers.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add Users to Team
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Autocomplete
              multiple
              options={availableUsers}
              loading={isLoadingUsers}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              getOptionLabel={(option) => 
                `${option.email} ${option.firstName ? `(${option.firstName} ${option.lastName || ''})` : ''}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select users to add"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ flex: 1 }}
              disabled={addUsersMutation.isPending}
            />
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAddUsers}
              disabled={selectedUsers.length === 0 || addUsersMutation.isPending}
            >
              Add
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Team Members ({selectedTeamForMembers.users.length})
          </Typography>
          <List>
            {selectedTeamForMembers.users.map((member) => (
              <ListItem key={member.id}>
                <ListItemText
                  primary={member.email}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {member.firstName && (
                        <Typography variant="body2">
                          {member.firstName} {member.lastName}
                        </Typography>
                      )}
                      {member.roles.map((role) => (
                        <Chip
                          key={role.id}
                          label={role.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveUser(member.id)}
                    disabled={removeUsersMutation.isPending}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {selectedTeamForMembers.users.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No members in this team"
                  secondary="Add users using the form above"
                />
              </ListItem>
            )}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeMembersDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};