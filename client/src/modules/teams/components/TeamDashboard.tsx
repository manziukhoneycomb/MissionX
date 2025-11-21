import React from 'react';
import { Box, Container } from '@mui/material';
import TeamList from './TeamList';
import TeamForm from './TeamForm';
import TeamMembers from './TeamMembers';

const TeamDashboard: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Box>
        <TeamList />
        <TeamForm />
        <TeamMembers />
      </Box>
    </Container>
  );
};

export default TeamDashboard;