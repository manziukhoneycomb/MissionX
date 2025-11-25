import React, { useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
  TextField,
  Typography,
  Divider,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import { addTeamMember, removeTeamMember } from '../teamMutations';
import { getUsers } from '../../users/userQueries';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { User } from '../../users/types/user';

type TeamMembersManagerProps = {
  team: Team;
};

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({ team }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    data: usersData,
    isLoading: isLoadingUsers,
  } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const users: User[] = usersData?.data ?? [];

  const availableUsers = useMemo(() => {
    const memberIds = new Set(team.members.map((m) => m.id));
    return users.filter((user) => !memberIds.has(user.id));
  }, [users, team.members]);

  const { mutateAsync: addMemberMutate, isPending: isAddingMember } = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      addTeamMember(teamId, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Member added successfully', { variant: 'success' });
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to add member', {
        variant: 'error',
      });
    },
  });

  const { mutateAsync: removeMemberMutate, isPending: isRemovingMember } = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to remove member', {
        variant: 'error',
      });
    },
  });

  const handleAddMember = async (): Promise<void> => {
    if (!selectedUser) return;
    await addMemberMutate({ teamId: team.id, userId: selectedUser.id });
  };

  const handleRemoveMember = async (userId: string): Promise<void> => {
    await removeMemberMutate({ teamId: team.id, userId });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current Members ({team.members.length})
        </Typography>
        {team.members.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No members in this team yet.
          </Typography>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            {team.members.map((member) => (
              <ListItem
                key={member.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="remove"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isRemovingMember}
                    color="error">
                    <DeleteIcon />
                  </IconButton>
                }>
                <ListItemText
                  primary={`${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || member.email}
                  secondary={member.email}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add Member
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Autocomplete
            fullWidth
            options={availableUsers}
            getOptionLabel={(option) =>
              `${option.firstName ?? ''} ${option.lastName ?? ''}`.trim() || option.email
            }
            value={selectedUser}
            onChange={(_, newValue) => setSelectedUser(newValue)}
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
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body1">
                    {`${option.firstName ?? ''} ${option.lastName ?? ''}`.trim() || option.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                </Box>
              </li>
            )}
          />
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={!selectedUser || isAddingMember}
            sx={{ minWidth: 100 }}>
            {isAddingMember ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TeamMembersManager;
