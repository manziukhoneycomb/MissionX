import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Team, TeamMember } from '../types/team';
import { useTeamManagementStore } from '../stores/team-store';
import { useRemoveTeamMember } from '../hooks/useTeamMembers';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';

type TeamMembersProps = {
  team: Team;
};

const TeamMembers: React.FC<TeamMembersProps> = ({ team }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const {
    openMemberForm,
    openConfirmRemoveMemberDialog,
    closeConfirmRemoveMemberDialog,
    isConfirmRemoveMemberDialogOpen,
    memberToRemoveId,
  } = useTeamManagementStore();

  const removeTeamMemberMutation = useRemoveTeamMember();

  const filteredMembers = team.members.filter((member) =>
    member.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.teamRole.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleEditMember = () => {
    if (selectedMember) {
      openMemberForm(team.id, selectedMember);
    }
    handleMenuClose();
  };

  const handleRemoveMember = () => {
    if (selectedMember) {
      openConfirmRemoveMemberDialog(selectedMember.id);
    }
    handleMenuClose();
  };

  const handleConfirmRemoveMember = async () => {
    if (memberToRemoveId) {
      await removeTeamMemberMutation.mutateAsync({
        teamId: team.id,
        memberId: memberToRemoveId,
      });
      closeConfirmRemoveMemberDialog();
    }
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    }
    return email?.[0]?.toUpperCase() || '?';
  };

  const getDisplayName = (member: TeamMember) => {
    if (member.userFirstName || member.userLastName) {
      return `${member.userFirstName || ''} ${member.userLastName || ''}`.trim();
    }
    return member.userEmail;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="h2">
            Team Members ({team.members.length})
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => openMemberForm(team.id)}
            size="small"
          >
            Add Member
          </Button>
        </Box>

        {team.members.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              No members in this team yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => openMemberForm(team.id)}
              sx={{ mt: 2 }}
            >
              Add First Member
            </Button>
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <TextField
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
            </Box>

            {filteredMembers.length === 0 ? (
              <Alert severity="info">
                No members found matching your search criteria
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell width={48}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {getInitials(
                                member.userFirstName,
                                member.userLastName,
                                member.userEmail
                              )}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {getDisplayName(member)}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="caption" color="textSecondary">
                                  {member.userEmail}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.teamRole.name}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, member)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditMember}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Change Role
          </MenuItem>
          <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Remove Member
          </MenuItem>
        </Menu>

        <ConfirmationDialog
          open={isConfirmRemoveMemberDialogOpen}
          title="Remove Team Member"
          message="Are you sure you want to remove this member from the team? They will lose access to team resources."
          onConfirm={handleConfirmRemoveMember}
          onClose={closeConfirmRemoveMemberDialog}
          confirmText="Remove"
          cancelText="Cancel"
        />
      </CardContent>
    </Card>
  );
};

export default TeamMembers;