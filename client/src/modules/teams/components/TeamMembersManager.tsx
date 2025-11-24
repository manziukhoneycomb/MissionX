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
import { Team } from '../types/team';
import { useUsers } from '../../users/userQueries';
import { User } from '../../users/types/user';

interface TeamMembersManagerProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  isLoading?: boolean;
}

const TeamMembersManager: React.FC<TeamMembersManagerProps> = ({
  open,
  onClose,
  team,
  onAddMember,
  onRemoveMember,
  isLoading,
}) => {
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const teamMemberIds = new Set(team.users?.map((u) => u.id) || []);
  const availableUsers = users?.filter((u) => !teamMemberIds.has(u.id)) || [];

  const handleAdd = () => {
    if (selectedUser) {
      onAddMember(selectedUser.id);
      setSelectedUser(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Members - {team.name}</DialogTitle>
      <DialogContent>
        <Box mb={3} mt={1}>
          <Box display="flex" gap={1}>
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
                  label="Add User"
                  placeholder="Select a user to add"
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
              onClick={handleAdd}
              disabled={!selectedUser || isLoading}>
              Add
            </Button>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          Current Members
        </Typography>
        <List dense>
          {team.users?.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No members in this team.
            </Typography>
          )}
          {team.users?.map((user) => (
            <ListItem key={user.id}>
              <ListItemText
                primary={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                secondary={user.email}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onRemoveMember(user.id)}
                  disabled={isLoading}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembersManager;
