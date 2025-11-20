import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Team, TeamMember, TeamRole } from '../types/team';

interface TeamMembersProps {
  open: boolean;
  team: Team | null;
  onClose: () => void;
  onAddMember: () => void;
  onUpdateMemberRole: (memberId: string, newRole: TeamRole) => void;
  onRemoveMember: (memberId: string) => void;
  isLoading?: boolean;
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  open,
  team,
  onClose,
  onAddMember,
  onUpdateMemberRole,
  onRemoveMember,
  isLoading = false,
}) => {
  const theme = useTheme();

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getChipColor = (role: TeamRole): 'primary' | 'secondary' | 'success' => {
    switch (role) {
      case 'OWNER':
        return 'primary';
      case 'ADMIN':
        return 'success';
      case 'MEMBER':
        return 'secondary';
      default:
        return 'secondary';
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Team Members - {team?.name || 'Unknown Team'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={onAddMember}
            size="small"
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            }}>
            Add Member
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <TableContainer>
          <Table stickyHeader aria-label="team members table">
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
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                '& td, & th': {
                  color: theme.palette.text.primary,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  py: 1,
                },
                '& tr:last-child td, & tr:last-child th': {
                  borderBottom: 0,
                },
              }}>
              {(!team?.members || team.members.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No members found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {team?.members?.map((member: TeamMember) => (
                <TableRow key={member.id}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {`${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || 
                       member.user.email.split('@')[0]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {member.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.teamRole}
                      size="small"
                      color={getChipColor(member.teamRole)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(member.joinedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Role">
                      <IconButton
                        size="small"
                        color="primary"
                        sx={{ mr: 0.5 }}
                        onClick={() => {
                          // For now, cycle through roles - in real implementation, 
                          // this would open a proper role selection dialog
                          const roles: TeamRole[] = ['MEMBER', 'ADMIN', 'OWNER'];
                          const currentIndex = roles.indexOf(member.teamRole);
                          const nextRole = roles[(currentIndex + 1) % roles.length];
                          onUpdateMemberRole(member.id, nextRole);
                        }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove Member">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRemoveMember(member.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMembers;