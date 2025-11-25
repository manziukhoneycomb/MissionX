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
  IconButton,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import { getUsers } from '../../users/userQueries';
import { getTeamMembers } from '../teamQueries';
import { addTeamMember, removeTeamMember } from '../teamMutations';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

type MemberManagementDialogProps = {
  open: boolean;
  team: Team | null;
  onClose: () => void;
};

const MemberManagementDialog: React.FC<MemberManagementDialogProps> = ({
  open,
  team,
  onClose,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    enabled: open && !!team,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS, team?.id],
    queryFn: () => {
      if (team) {
        return getTeamMembers(team.id);
      }
      throw new Error('Team is required');
    },
    enabled: open && !!team,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const addMemberMutation = useMutation({
    mutationFn: addTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      if (team) {
        queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM, team.id] });
        queryClient.invalidateQueries({
          queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS, team.id],
        });
      }
      enqueueSnackbar('Member added successfully', { variant: 'success' });
      setSelectedUserId('');
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to add member', { variant: 'error' });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      if (team) {
        queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM, team.id] });
        queryClient.invalidateQueries({
          queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS, team.id],
        });
      }
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to remove member', { variant: 'error' });
    },
  });

  const handleAddMember = () => {
    if (team && selectedUserId) {
      addMemberMutation.mutate({ teamId: team.id, userId: selectedUserId });
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (team) {
      removeMemberMutation.mutate({ teamId: team.id, userId });
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setSelectedUserId(event.target.value);
  };

  const users = usersData?.data || [];
  const members = membersData?.data || [];
  const memberIds = new Set(members.map((m: { id: string }) => m.id));
  const availableUsers = users.filter((u) => !memberIds.has(u.id));

  const isLoading = usersLoading || membersLoading;
  const isMutating = addMemberMutation.isPending || removeMemberMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Team Members - {team?.name}</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Add Member
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select User</InputLabel>
                  <Select
                    value={selectedUserId}
                    label="Select User"
                    onChange={handleSelectChange}
                    disabled={isMutating || availableUsers.length === 0}
                  >
                    {availableUsers.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.email} {user.firstName && `(${user.firstName} ${user.lastName})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disabled={!selectedUserId || isMutating}
                  sx={{ minWidth: '100px' }}
                >
                  Add
                </Button>
              </Box>
              {availableUsers.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  All users are already members
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current Members ({members.length})
            </Typography>
            {members.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No members yet
              </Typography>
            ) : (
              <List>
                {members.map((member: { id: string; email: string; firstName?: string; lastName?: string }) => (
                  <ListItem
                    key={member.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isMutating}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={member.email}
                      secondary={
                        member.firstName
                          ? `${member.firstName} ${member.lastName || ''}`
                          : undefined
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isMutating}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberManagementDialog;
