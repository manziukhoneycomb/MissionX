import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  FormHelperText,
  Autocomplete,
  Avatar,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { useAddTeamMember, useUpdateTeamMember } from '../hooks/useTeamMembers';
import { useTeamRoles } from '../hooks/useTeams';
import { useQuery } from '@tanstack/react-query';
import { useTeamManagementStore } from '../stores/team-store';
import { AddTeamMemberInput, UpdateTeamMemberInput } from '../types/team';
import { getUsers } from '../../users/userQueries';
import { User } from '../../users/types/user';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

const teamMemberSchema = Yup.object().shape({
  userId: Yup.string().required('User is required'),
  teamRoleId: Yup.string().required('Role is required'),
});

type TeamMemberFormValues = {
  userId: string;
  teamRoleId: string;
};

const TeamMemberForm: React.FC = () => {
  const {
    selectedMember,
    currentTeamId,
    closeMemberForm,
  } = useTeamManagementStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const addTeamMemberMutation = useAddTeamMember();
  const updateTeamMemberMutation = useUpdateTeamMember();
  const { data: teamRolesData, isLoading: rolesLoading } = useTeamRoles();
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const teamRoles = teamRolesData?.data ?? [];
  const users = usersData?.data ?? [];
  const isEditing = !!selectedMember;

  const initialValues: TeamMemberFormValues = {
    userId: selectedMember?.userId ?? '',
    teamRoleId: selectedMember?.teamRole.id ?? '',
  };

  useEffect(() => {
    if (selectedMember && users.length > 0) {
      const user = users.find(u => u.id === selectedMember.userId);
      setSelectedUser(user || null);
    }
  }, [selectedMember, users]);

  const handleSubmit = async (values: TeamMemberFormValues) => {
    if (!currentTeamId) return;

    try {
      if (isEditing && selectedMember) {
        const updateData: UpdateTeamMemberInput = {
          teamRoleId: values.teamRoleId,
        };
        await updateTeamMemberMutation.mutateAsync({
          teamId: currentTeamId,
          memberId: selectedMember.id,
          data: updateData,
        });
      } else {
        const addData: AddTeamMemberInput = {
          userId: values.userId,
          teamRoleId: values.teamRoleId,
        };
        await addTeamMemberMutation.mutateAsync({
          teamId: currentTeamId,
          data: addData,
        });
      }
      closeMemberForm();
    } catch (error) {
      // Error handling is done in the mutations
    }
  };

  const isSubmitting = addTeamMemberMutation.isPending || updateTeamMemberMutation.isPending;

  const getDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  const getInitials = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    return user.email[0]?.toUpperCase() || '?';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Update Team Member' : 'Add Team Member'}
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={teamMemberSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue, dirty }) => (
          <Form noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {!isEditing ? (
                <Autocomplete
                  options={users}
                  getOptionLabel={(user) => getDisplayName(user)}
                  value={selectedUser}
                  onChange={(_, newValue) => {
                    setSelectedUser(newValue);
                    setFieldValue('userId', newValue?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select User"
                      required
                      error={touched.userId && !!errors.userId}
                      helperText={touched.userId && errors.userId}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: selectedUser && (
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            {getInitials(selectedUser)}
                          </Avatar>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, user) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {getInitials(user)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {getDisplayName(user)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  loading={usersLoading}
                  disabled={isSubmitting}
                />
              ) : (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Member
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {selectedMember?.userFirstName?.[0] || selectedMember?.userLastName?.[0] || selectedMember?.userEmail[0] || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {selectedMember?.userFirstName || selectedMember?.userLastName 
                          ? `${selectedMember.userFirstName || ''} ${selectedMember.userLastName || ''}`.trim()
                          : selectedMember?.userEmail}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedMember?.userEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              <FormControl
                fullWidth
                required
                error={touched.teamRoleId && !!errors.teamRoleId}
                disabled={rolesLoading || isSubmitting}
              >
                <InputLabel>Team Role</InputLabel>
                <Select
                  value={values.teamRoleId}
                  onChange={(e) => setFieldValue('teamRoleId', e.target.value)}
                  label="Team Role"
                >
                  {rolesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                      Loading roles...
                    </MenuItem>
                  ) : (
                    teamRoles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <Box>
                          <Typography variant="body2">{role.name}</Typography>
                          {role.description && (
                            <Typography variant="caption" color="textSecondary">
                              {role.description}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {touched.teamRoleId && errors.teamRoleId && (
                  <FormHelperText>{errors.teamRoleId}</FormHelperText>
                )}
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  onClick={closeMemberForm}
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || (!dirty && isEditing)}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      {isEditing ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    isEditing ? 'Update Member' : 'Add Member'
                  )}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default TeamMemberForm;