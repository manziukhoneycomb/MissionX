import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useTeams, useDeleteTeam } from '../hooks/useTeams';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { Team } from '../types/team';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';

const TeamList: React.FC = () => {
  const { data: teamsData, isLoading, error } = useTeams();
  const deleteTeamMutation = useDeleteTeam();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const {
    openCreateForm,
    openEditForm,
    openMembersDialog,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    resetDeleteState,
  } = useTeamManagementStore();

  const teams = teamsData?.data ?? [];

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;
    const query = searchQuery.toLowerCase();
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.description?.toLowerCase().includes(query),
    );
  }, [teams, searchQuery]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, team: Team) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeam(team);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeam(null);
  };

  const handleEdit = () => {
    if (selectedTeam) {
      openEditForm(selectedTeam);
    }
    handleMenuClose();
  };

  const handleMembers = () => {
    if (selectedTeam) {
      openMembersDialog(selectedTeam);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTeam) {
      openConfirmDeleteDialog(selectedTeam.id);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (teamToDeleteId) {
      try {
        await deleteTeamMutation.mutateAsync(teamToDeleteId);
        resetDeleteState();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleCancelDelete = () => {
    closeConfirmDeleteDialog();
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load teams. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Teams
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
          Create Team
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search teams by name or description..."
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
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={24} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : filteredTeams.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No teams match your search' : 'No teams created yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Create your first team to get started with team collaboration'}
            </Typography>
            {!searchQuery && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
                Create First Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 2,
          }}
        >
          {filteredTeams.map((team) => (
            <Card key={team.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" noWrap sx={{ flexGrow: 1, pr: 1 }}>
                    {team.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, team)}
                    aria-label="team options"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {team.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {team.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${team.memberCount || 0} members`}
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Team</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMembers}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Members</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Team</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        title="Delete Team"
        message={'Are you sure you want to delete this team? This action cannot be undone and all team members will be removed.'}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonProps={{
          disabled: deleteTeamMutation.isPending,
          variant: 'contained',
          color: 'error',
        }}
      />
    </Box>
  );
};

export default TeamList;