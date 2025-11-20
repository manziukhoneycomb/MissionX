import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import TeamList from '../components/TeamList';
import TeamForm from '../components/TeamForm';
import TeamMembers from '../components/TeamMembers';
import TeamMemberForm from '../components/TeamMemberForm';
import { useTeamManagementStore } from '../stores/team-store';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TeamManagementPage: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    isFormOpen,
    selectedTeam,
    closeForm,
    isMemberFormOpen,
    closeMemberForm,
  } = useTeamManagementStore();

  const showTeamDetails = selectedTeam && isFormOpen;

  return (
    <Box>
      <TeamList />

      {/* Team Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={closeForm}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedTeam ? 'Team Details' : 'Create New Team'}
          <IconButton onClick={closeForm} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <TeamForm />
            
            {showTeamDetails && (
              <Box>
                <TeamMembers team={selectedTeam} />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Team Member Form Dialog */}
      <Dialog
        open={isMemberFormOpen}
        onClose={closeMemberForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Team Member
          <IconButton onClick={closeMemberForm} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TeamMemberForm />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TeamManagementPage;