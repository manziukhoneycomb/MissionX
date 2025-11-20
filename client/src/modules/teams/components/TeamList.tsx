import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Box,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Team } from '../types/team';

interface TeamListProps {
  teams: Team[];
  isLoading: boolean;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onToggleStatus: (team: Team) => void;
  onManageMembers: (team: Team) => void;
  isDeleting?: boolean;
  deletingTeamId?: string | null;
  isTogglingStatus?: boolean;
  toggleStatusTeamId?: string | null;
}

const TeamList: React.FC<TeamListProps> = ({
  teams,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageMembers,
  isDeleting = false,
  deletingTeamId = null,
  isTogglingStatus = false,
  toggleStatusTeamId = null,
}) => {
  const theme = useTheme();

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table stickyHeader aria-label="teams table">
        <TableHead>
          <TableRow
            sx={{
              '& th': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.secondary,
                fontWeight: 'bold',
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            }}>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Members</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            '& tr': {
              '&:hover': {},
            },
            '& td, & th': {
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 1,
            },
            '& tr:last-child td, & tr:last-child th': {
              borderBottom: 0,
            },
          }}>
          {teams.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No teams found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="medium">
                  {team.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {team.description || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {team.members?.length || 0} members
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  icon={team.isActive ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />}
                  label={team.isActive ? 'Active' : 'Inactive'}
                  color={team.isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(team.createdAt)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Manage Members">
                  <IconButton
                    onClick={() => onManageMembers(team)}
                    size="small"
                    color="info"
                    sx={{ mr: 0.5 }}>
                    <PeopleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={team.isActive ? 'Deactivate Team' : 'Activate Team'}>
                  <IconButton
                    onClick={() => onToggleStatus(team)}
                    size="small"
                    color={team.isActive ? 'warning' : 'success'}
                    sx={{ mr: 0.5 }}
                    disabled={isTogglingStatus && toggleStatusTeamId === team.id}>
                    {team.isActive ? <HighlightOffIcon /> : <CheckCircleOutlineIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Team">
                  <IconButton
                    onClick={() => onEdit(team)}
                    size="small"
                    color="primary"
                    sx={{ mr: 0.5 }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Team">
                  <IconButton
                    onClick={() => onDelete(team.id)}
                    size="small"
                    color="error"
                    disabled={isDeleting && deletingTeamId === team.id}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamList;