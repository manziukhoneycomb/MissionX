import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Team } from '../types/team';
import { useUsers } from '../../users/userQueries';
import { User } from '../../users/types/user';
import { useAddTeamMember, useRemoveTeamMember } from '../teamMutations';

interface TeamMembersManagerProps {
  team: Team;
}

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({ team }) => {
  const { data: allUsers, isLoading: isLoadingUsers } = useUsers();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddMember = () => {
    if (selectedUser) {
      addMemberMutation.mutate(
        { teamId: team.id, userId: selectedUser.id },
        {
          onSuccess: () => {
            setSelectedUser(null);
          },
        },
      );
    }
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate({ teamId: team.id, userId });
  };

  const teamMemberIds = new Set(team.users?.map((u) => u.id));
  const availableUsers = allUsers?.filter((u) => !teamMemberIds.has(u.id)) || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Team Members ({team.users?.length || 0})
      </Typography>
      <List>
        {team.users?.map((user) => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.email}
              secondary={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
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
        {team.users?.length === 0 && (
          <ListItem>
            <ListItemText primary="No members in this team yet." />
          </ListItem>
        )}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Add Member
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Autocomplete
          sx={{ flexGrow: 1 }}
          options={availableUsers}
          getOptionLabel={(option) => option.email}
          value={selectedUser}
          onChange={(_, newValue) => {
            setSelectedUser(newValue);
          }}
          loading={isLoadingUsers}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select User"
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
        />
        <Button
          variant="contained"
          onClick={handleAddMember}
          disabled={!selectedUser || addMemberMutation.isPending}>
          {addMemberMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Add'}
        </Button>
      </Box>
    </Box>
  );
};

export default TeamMembersManager;
