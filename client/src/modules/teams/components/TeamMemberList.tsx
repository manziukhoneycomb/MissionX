import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { TeamMember } from '../types/team';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { ROLES } from '../../../common/constants/roles';

interface TeamMemberListProps {
  teamId: string;
  teamMembers: TeamMember[];
  canManageMembers: boolean;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  teamId,
  teamMembers,
  canManageMembers,
}) => {
  const theme = useTheme();
  const { openConfirmRemoveMemberDialog } = useTeamManagementStore();

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'error';
      case ROLES.ADMIN:
        return 'warning';
      case ROLES.USER:
        return 'primary';
      default:
        return 'default';
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  if (teamMembers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <PersonIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No team members yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {canManageMembers
            ? 'Add members to this team to get started.'
            : 'This team has no members currently.'}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
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
            <TableCell>Member</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined Date</TableCell>
            {canManageMembers && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            '& td, & th': {
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 1.5,
            },
            '& tr:last-child td, & tr:last-child th': {
              borderBottom: 0,
            },
          }}>
          {teamMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                    }}>
                    {getInitials(
                      member.user.firstName,
                      member.user.lastName,
                      member.user.email,
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {member.user.firstName && member.user.lastName
                        ? `${member.user.firstName} ${member.user.lastName}`
                        : member.user.firstName || member.user.lastName || 'Unnamed User'}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{member.user.email}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={member.role}
                  size="small"
                  color={getRoleColor(member.role) as any}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{formatDate(member.joinedAt)}</TableCell>
              {canManageMembers && (
                <TableCell align="right">
                  <Tooltip title="Edit Member Role">
                    <IconButton size="small" color="primary" sx={{ mr: 0.5 }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove Member">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => openConfirmRemoveMemberDialog(member)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamMemberList;