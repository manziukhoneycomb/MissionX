import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Autocomplete,
  TextField,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Team } from '../types/team';
import { User } from '../../users/types/user';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../users/userQueries';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { useAddTeamMember, useRemoveTeamMember } from '../teamMutations';

type TeamMembersManagerProps = {
  open: boolean;
  onClose: () => void;
  team: Team;
};

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({ open, onClose, team }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers().then((response) => response.data),
    staleTime: CACHE_TIMES.FIVE_MINUTES,
    enabled: open,
  });

  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const availableUsers = useMemo(() => {
    if (!usersData) return [];
    const memberIds = team.users.map((u) => u.id);
    return usersData.filter((user) => !memberIds.includes(user.id) && user.isActive);
  }, [usersData, team.users]);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    
    await addMemberMutation.mutateAsync({
      teamId: team.id,
      input: { userId: selectedUser.id },
    });
    
    setSelectedUser(null);
  };

  const handleRemoveMember = async (userId: string) => {
    await removeMemberMutation.mutateAsync({
      teamId: team.id,
      userId,
    });
  };

  const isLoading = addMemberMutation.isPending || removeMemberMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Team Members - {team.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Member
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Autocomplete
              options={availableUsers}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              getOptionLabel={(option) => `${option.email} ${option.firstName || ''} ${option.lastName || ''}`.trim()}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.email}</Typography>
                    {(option.firstName || option.lastName) && (
                      <Typography variant="body2" color="text.secondary">
                        {option.firstName} {option.lastName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  placeholder="Search by email or name"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingUsers && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              loading={isLoadingUsers}
              disabled={isLoading || isLoadingUsers}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddMember}
              disabled={!selectedUser || isLoading}
              startIcon={<PersonAddIcon />}
            >
              Add
            </Button>
          </Box>

          <Divider />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Current Members ({team.users.length})
          </Typography>
          
          {team.users.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No members in this team yet
            </Typography>
          ) : (
            <List>
              {team.users.map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemText
                    primary={user.email}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {(user.firstName || user.lastName) && (
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                        )}
                        {user.roles.map((role) => (
                          <Chip key={role.id} label={role.name} size="small" />
                        ))}
                      </Stack>
                    }
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
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersManager;