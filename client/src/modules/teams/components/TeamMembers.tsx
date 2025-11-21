import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTeamMembers, useAddTeamMember, useUpdateTeamMember, useRemoveTeamMember } from '../hooks/useTeamMembers';
import { useTeamRoles } from '../hooks/useTeams';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../users/userQueries';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { TeamMember, AddTeamMemberInput, UpdateTeamMemberInput } from '../types/team';
import { User } from '../../users/types/user';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

const TeamMembers: React.FC = () => {
  const {
    isMembersDialogOpen,
    selectedTeamForMembers,
    isAddMemberDialogOpen,
    memberToRemoveId,
    isConfirmRemoveMemberDialogOpen,
    searchQuery,
    closeMembersDialog,
    openAddMemberDialog,
    closeAddMemberDialog,
    openConfirmRemoveMemberDialog,
    closeConfirmRemoveMemberDialog,
    setSearchQuery,
  } = useTeamManagementStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const teamId = selectedTeamForMembers?.id || '';

  const { data: membersData, isLoading: membersLoading, error: membersError } = useTeamMembers(teamId);
  const { data: rolesData, isLoading: rolesLoading } = useTeamRoles();
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: isAddMemberDialogOpen,
  });

  const addMemberMutation = useAddTeamMember();
  const updateMemberMutation = useUpdateTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const members = membersData?.data ?? [];
  const roles = rolesData?.data ?? [];
  const users = usersData?.data ?? [];

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.user.email.toLowerCase().includes(query) ||
        member.user.firstName?.toLowerCase().includes(query) ||
        member.user.lastName?.toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  const availableUsers = useMemo(() => {
    const memberUserIds = new Set(members.map(m => m.userId));
    return users.filter(user => !memberUserIds.has(user.id));
  }, [users, members]);

  const teamRoles = roles.filter(role => role.isTeamRole);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRemoveMember = () => {
    if (selectedMember) {
      openConfirmRemoveMemberDialog(selectedMember.userId);
    }
    handleMenuClose();
  };

  const handleAddMember = async () => {
    if (selectedUser && selectedRole && selectedTeamForMembers) {
      try {
        const data: AddTeamMemberInput = {
          userId: selectedUser.id,
          roleId: selectedRole,
        };
        await addMemberMutation.mutateAsync({
          teamId: selectedTeamForMembers.id,
          data,
        });
        setSelectedUser(null);
        setSelectedRole('');
        closeAddMemberDialog();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleConfirmRemove = async () => {
    if (memberToRemoveId && selectedTeamForMembers) {
      try {
        await removeMemberMutation.mutateAsync({
          teamId: selectedTeamForMembers.id,
          userId: memberToRemoveId,
        });
        closeConfirmRemoveMemberDialog();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleRoleChange = async (member: TeamMember, newRoleId: string) => {
    if (selectedTeamForMembers) {
      try {
        const data: UpdateTeamMemberInput = { roleId: newRoleId };
        await updateMemberMutation.mutateAsync({
          teamId: selectedTeamForMembers.id,
          userId: member.userId,
          data,
        });
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const getInitials = (user: { firstName?: string; lastName?: string; email: string }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getDisplayName = (user: { firstName?: string; lastName?: string; email: string }) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  if (!selectedTeamForMembers) return null;

  return (
    <>
      <Dialog
        open={isMembersDialogOpen}
        onClose={closeMembersDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: '60vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedTeamForMembers.name} Members
            </Typography>
            <IconButton onClick={closeMembersDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={openAddMemberDialog}
              sx={{ minWidth: 'fit-content' }}
            >
              Add Member
            </Button>
          </Box>

          {membersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load team members. Please try again.
            </Alert>
          )}

          {membersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredMembers.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery ? 'No members match your search' : 'No team members yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'Add members to start collaborating'
                  }
                </Typography>
                {!searchQuery && (
                  <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openAddMemberDialog}>
                    Add First Member
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <List>
              {filteredMembers.map((member) => (
                <ListItem key={member.id} divider>
                  <ListItemAvatar>
                    <Avatar>{getInitials(member.user)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getDisplayName(member.user)}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {member.user.email}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={member.role.id}
                              onChange={(e) => handleRoleChange(member, e.target.value)}
                              disabled={updateMemberMutation.isPending}
                            >
                              {teamRoles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                  {role.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                        variant="outlined"
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, member)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeMembersDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAddMemberDialogOpen}
        onClose={closeAddMemberDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(user) => `${getDisplayName(user)} (${user.email})`}
              value={selectedUser}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              loading={usersLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  required
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
              renderOption={(props, user) => (
                <Box component="li" {...props}>
                  <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                    {getInitials(user)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{getDisplayName(user)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            <FormControl required>
              <InputLabel>Team Role</InputLabel>
              <Select
                value={selectedRole}
                label="Team Role"
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={rolesLoading}
              >
                {teamRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddMemberDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={!selectedUser || !selectedRole || addMemberMutation.isPending}
            startIcon={addMemberMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
          Remove from Team
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={isConfirmRemoveMemberDialogOpen}
        title="Remove Team Member"
        message="Are you sure you want to remove this member from the team? This action cannot be undone."
        onConfirm={handleConfirmRemove}
        onClose={closeConfirmRemoveMemberDialog}
        confirmText="Remove"
        cancelText="Cancel"
        confirmButtonProps={{
          disabled: removeMemberMutation.isPending,
          variant: 'contained',
          color: 'error',
        }}
      />
    </>
  );
};

export default TeamMembers;