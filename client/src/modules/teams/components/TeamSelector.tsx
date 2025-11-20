import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { useTeamContext } from '../contexts/TeamContext';
import { Team } from '../types/team';

interface TeamSelectorProps {
  showLabel?: boolean;
  variant?: 'outlined' | 'standard' | 'filled';
  size?: 'small' | 'medium';
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  showLabel = true,
  variant = 'outlined',
  size = 'small',
}) => {
  const theme = useTheme();
  const { selectedTeam, setSelectedTeam, availableTeams, isLoadingTeams } = useTeamContext();

  const handleTeamChange = (event: SelectChangeEvent<string>) => {
    const teamId = event.target.value;
    const team = availableTeams.find((t: Team) => t.id === teamId) || null;
    setSelectedTeam(team);
  };

  const activeTeams = availableTeams.filter((team: Team) => team.isActive);

  if (isLoadingTeams) {
    return (
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="body2" color="text.secondary">
          Loading teams...
        </Typography>
      </Box>
    );
  }

  if (activeTeams.length === 0) {
    return (
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="body2" color="text.secondary">
          No teams available
        </Typography>
      </Box>
    );
  }

  return (
    <FormControl
      variant={variant}
      size={size}
      sx={{
        minWidth: 150,
        '& .MuiOutlinedInput-root': {
          color: theme.palette.text.primary,
          '& fieldset': {
            borderColor: theme.palette.divider,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.text.secondary,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
          },
        },
        '& .MuiInputLabel-root': {
          color: theme.palette.text.secondary,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        },
      }}>
      {showLabel && <InputLabel>Team</InputLabel>}
      <Select
        value={selectedTeam?.id || ''}
        onChange={handleTeamChange}
        label={showLabel ? 'Team' : undefined}
        displayEmpty={!showLabel}>
        {!showLabel && !selectedTeam && (
          <MenuItem value="" disabled>
            Select Team
          </MenuItem>
        )}
        {activeTeams.map((team: Team) => (
          <MenuItem key={team.id} value={team.id}>
            {team.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TeamSelector;