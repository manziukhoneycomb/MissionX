import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTeams, useDeleteTeam } from '../hooks/useTeams';
import { useTeamManagementStore } from '../stores/team-store';
import { Team } from '../types/team';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';

const TeamList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { data: teamsData, isLoading, error } = useTeams();
  const deleteTeamMutation = useDeleteTeam();

  const {
    openCreateForm,
    openEditForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
  } = useTeamManagementStore();

  const teams = teamsData?.data ?? [];

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, team: Team) => {
    event.stopPropagation();
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

  const handleDelete = () => {
    if (selectedTeam) {
      openConfirmDeleteDialog(selectedTeam.id);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (teamToDeleteId) {
      await deleteTeamMutation.mutateAsync(teamToDeleteId);
      closeConfirmDeleteDialog();
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load teams. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Teams
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateForm}
        >
          Create Team
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {filteredTeams.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm ? 'No teams found matching your search' : 'No teams found'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openCreateForm}
              sx={{ mt: 2 }}
            >
              Create Your First Team
            </Button>
          )}
        </Box>
      ) : (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              md: '1fr 1fr', 
              lg: 'repeat(3, 1fr)' 
            }, 
            gap: 3 
          }}
        >
          {filteredTeams.map((team) => (
            <Box key={team.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
                onClick={() => openEditForm(team)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                      {team.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, team)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {team.description && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 40,
                      }}
                    >
                      {team.description}
                    </Typography>
                  )}

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SettingsIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {team.permissions.length} permission{team.permissions.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={team.isActive ? 'Active' : 'Inactive'}
                      color={team.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Team
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Team
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        title="Delete Team"
        message={`Are you sure you want to delete this team? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={closeConfirmDeleteDialog}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default TeamList;