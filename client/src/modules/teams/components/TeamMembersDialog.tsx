import React, { useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  TextField,
  Autocomplete,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { Team } from '../types/team';
import { useAddTeamMembers, useRemoveTeamMembers } from '../teamMutations';
import { getUsers } from '../../users/userQueries';
import { User } from '../../users/types/user';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';

type TeamMembersDialogProps = {
  open: boolean;
  onClose: () => void;
  team: Team;
};

const TeamMembersDialog: React.FC<TeamMembersDialogProps> = ({ open, onClose, team }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    enabled: open,
  });

  const addMembersMutation = useAddTeamMembers();
  const removeMembersMutation = useRemoveTeamMembers();

  const allUsers = usersData?.data || [];
  
  const availableUsers = useMemo(() => {
    const memberIds = new Set(team.members.map(member => member.id));
    return allUsers.filter(user => 
      !memberIds.has(user.id) && user.tenant.id === team.tenantId
    );
  }, [allUsers, team.members, team.tenantId]);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await addMembersMutation.mutateAsync({
        teamId: team.id,
        data: { userIds: selectedUsers.map(user => user.id) },
      });
      enqueueSnackbar('Members added successfully', { variant: 'success' });
      setSelectedUsers([]);
    } catch (error) {
      enqueueSnackbar('Failed to add members', { variant: 'error' });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMembersMutation.mutateAsync({
        teamId: team.id,
        data: { userIds: [memberId] },
      });
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to remove member', { variant: 'error' });
    }
  };

  const isProcessing = addMembersMutation.isPending || removeMembersMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Team Members - {team.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add Members
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Autocomplete
              multiple
              options={availableUsers}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              getOptionLabel={(option) => `${option.email} ${option.firstName || ''} ${option.lastName || ''}`}
              loading={isLoadingUsers}
              disabled={isProcessing}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.email}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select users to add"
                  placeholder="Type to search users..."
                />
              )}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isProcessing}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Current Members ({team.members.length})
          </Typography>
          {team.members.length > 0 ? (
            <List>
              {team.members.map((member) => (
                <ListItem key={member.id}>
                  <ListItemText
                    primary={member.email}
                    secondary={
                      member.firstName || member.lastName
                        ? `${member.firstName || ''} ${member.lastName || ''}`
                        : null
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="remove"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isProcessing}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
              No members in this team yet.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersDialog;