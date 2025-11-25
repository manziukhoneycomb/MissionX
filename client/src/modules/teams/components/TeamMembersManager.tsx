import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Team } from '../types/team';
import { useAddTeamMember, useRemoveTeamMember } from '../teamMutations';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../users/userQueries';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

type TeamMembersManagerProps = {
  open: boolean;
  team: Team | null;
  onClose: () => void;
};

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({ open, team, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const { mutateAsync: addMemberMutate, isPending: isAdding } = useAddTeamMember();
  const { mutateAsync: removeMemberMutate, isPending: isRemoving } = useRemoveTeamMember();

  const users = usersData?.data ?? [];
  const teamMembers = team?.members ?? [];
  const memberIds = new Set(teamMembers.map((m) => m.id));
  const availableUsers = users.filter((u) => !memberIds.has(u.id));

  const handleAddMember = async () => {
    if (!team || !selectedUserId) return;

    try {
      await addMemberMutate({
        teamId: team.id,
        data: { userId: selectedUserId },
      });
      enqueueSnackbar('Member added successfully', { variant: 'success' });
      setSelectedUserId('');
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to add member',
        { variant: 'error' }
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team) return;

    try {
      await removeMemberMutate({ teamId: team.id, userId });
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to remove member',
        { variant: 'error' }
      );
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setSelectedUserId(e.target.value);
  };

  const isOperating = isAdding || isRemoving;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Team Members - {team?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Members ({teamMembers.length})
            </Typography>
            {teamMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No members in this team
              </Typography>
            ) : (
              <List>
                {teamMembers.map((member) => (
                  <ListItem
                    key={member.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isOperating}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                    <ListItemText
                      primary={`${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email}
                      secondary={member.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Add Member
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <FormControl fullWidth disabled={usersLoading || isOperating}>
                <InputLabel id="user-select-label">Select User</InputLabel>
                <Select
                  labelId="user-select-label"
                  value={selectedUserId}
                  label="Select User"
                  onChange={handleSelectChange}>
                  <MenuItem value="" disabled>
                    <em>{usersLoading ? 'Loading users...' : 'Select User'}</em>
                  </MenuItem>
                  {availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleAddMember}
                disabled={!selectedUserId || isOperating}
                sx={{ minWidth: 100 }}>
                {isAdding ? <CircularProgress size={24} /> : 'Add'}
              </Button>
            </Box>
            {availableUsers.length === 0 && !usersLoading && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All users are already members of this team
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onClose} disabled={isOperating}>
              Close
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMembersManager;
