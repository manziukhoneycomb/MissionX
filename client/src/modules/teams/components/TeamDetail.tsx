import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  useTheme,
  Breadcrumbs,
  Link,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useQuery } from '@tanstack/react-query';
import { getTeamById } from '../teamQueries';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import TeamMemberList from './TeamMemberList';
import { useTeamManagementStore } from '../stores/teamManagementStore';

const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const userRoles = useUserRoles();
  const isAdmin = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);

  const { openEditForm, openAddMemberDialog } = useTeamManagementStore();

  const {
    data: teamData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM, teamId],
    queryFn: () => getTeamById(teamId!),
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: !!teamId,
  });

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message || 'Failed to load team details', {
        variant: 'error',
      });
    }
  }, [error, enqueueSnackbar]);

  const team = teamData?.data;

  const handleBack = () => {
    navigate('/teams');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
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

  if (!team) {
    return (
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Typography variant="h6" color="error">
          Team not found
        </Typography>
        <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Teams
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={handleBack}
            sx={{ cursor: 'pointer' }}>
            Teams
          </Link>
          <Typography color="text.primary">{team.name}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            size="small">
            Back
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="outlined"
                onClick={() => openEditForm(team)}
                startIcon={<EditIcon />}
                size="small">
                Edit Team
              </Button>
              <Button
                variant="contained"
                onClick={() => openAddMemberDialog(team)}
                startIcon={<GroupAddIcon />}
                size="small">
                Add Member
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              {team.name}
            </Typography>
          }
          subheader={
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Created on {formatDate(team.createdAt)}
              </Typography>
              {team.description && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {team.description}
                </Typography>
              )}
            </Box>
          }
        />

        <Divider />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="team detail tabs">
            <Tab label={`Members (${team.teamMembers?.length || 0})`} />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <CardContent>
          {tabValue === 0 && (
            <TeamMemberList
              teamId={team.id}
              teamMembers={team.teamMembers || []}
              canManageMembers={isAdmin}
            />
          )}
          {tabValue === 1 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                Team Information
              </Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Team ID
                  </Typography>
                  <Typography variant="body2">{team.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tenant
                  </Typography>
                  <Typography variant="body2">{team.tenant?.name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body2">{formatDate(team.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">{formatDate(team.updatedAt)}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeamDetail;