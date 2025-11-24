import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
  Autocomplete,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useSnackbar } from 'notistack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Team, TeamMember } from '../types/team';
import { User } from '../../users/types/user';
import { getUsers } from '../../users/userQueries';
import { useManageTeamMembers } from '../teamMutations';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

interface TeamMembersDialogProps {
  open: boolean;
  onClose: () => void;
  team: Team;
}

const TeamMembersDialog: React.FC<TeamMembersDialogProps> = ({ open, onClose, team }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [currentMemberIds, setCurrentMemberIds] = useState<string[]>([]);

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: open,
  });

  const users: User[] = usersData?.data ?? [];

  const { mutateAsync: updateMembersMutate, isPending: isUpdating } = useManageTeamMembers();

  useEffect(() => {
    if (team && team.users) {
      setCurrentMemberIds(team.users.map(member => member.id));
    }
  }, [team]);

  useEffect(() => {
    if (usersError) {
      enqueueSnackbar(usersError.message || 'Failed to load users', {
        variant: 'error',
      });
    }
  }, [usersError, enqueueSnackbar]);

  const availableUsers = useMemo(() => {
    const tenantUsers = users.filter(user => 
      user.tenant?.id === team.tenant?.id && 
      !currentMemberIds.includes(user.id) &&
      user.isActive
    );
    return tenantUsers;
  }, [users, currentMemberIds, team.tenant?.id]);

  const currentMembers = useMemo(() => {
    return team.users || [];
  }, [team.users]);

  const handleAddMembers = () => {
    const newMemberIds = selectedUsers.map(user => user.id);
    setCurrentMemberIds([...currentMemberIds, ...newMemberIds]);
    setSelectedUsers([]);
  };

  const handleRemoveMember = (memberId: string) => {
    setCurrentMemberIds(currentMemberIds.filter(id => id !== memberId));
  };

  const handleSave = async () => {
    try {
      await updateMembersMutate({ id: team.id, userIds: currentMemberIds });
      enqueueSnackbar('Team members updated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM_BY_ID, team.id] });
      onClose();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to update team members',
        { variant: 'error' }
      );
    }
  };

  const hasChanges = () => {
    const originalIds = team.users?.map(member => member.id) || [];
    return JSON.stringify(originalIds.sort()) !== JSON.stringify(currentMemberIds.sort());
  };

  const getMemberDetails = (memberId: string): TeamMember | User | undefined => {
    const existingMember = currentMembers.find(member => member.id === memberId);
    if (existingMember) return existingMember;
    
    return users.find(user => user.id === memberId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        Manage Team Members - {team.name}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add New Members
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Autocomplete
              multiple
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              options={availableUsers}
              getOptionLabel={(option) => `${option.email} (${option.firstName || ''} ${option.lastName || ''})`}
              loading={usersLoading}
              disabled={isUpdating}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select users to add"
                  placeholder="Start typing to search..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isUpdating}>
              Add
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current Members ({currentMemberIds.length})
          </Typography>
          
          {currentMemberIds.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No members in this team
            </Typography>
          ) : (
            <List>
              {currentMemberIds.map((memberId) => {
                const member = getMemberDetails(memberId);
                if (!member) return null;
                
                return (
                  <ListItem
                    key={memberId}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}>
                    <ListItemText
                      primary={member.email}
                      secondary={`${member.firstName || ''} ${member.lastName || ''}`.trim() || 'No name'}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemoveMember(memberId)}
                        disabled={isUpdating}
                        color="error"
                        size="small">
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isUpdating || !hasChanges()}>
          {isUpdating ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersDialog;