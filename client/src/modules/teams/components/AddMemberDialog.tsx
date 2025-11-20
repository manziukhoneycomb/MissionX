import React, { useEffect, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent,
  useTheme,
  Autocomplete,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import { addTeamMember, AddTeamMemberInput } from '../teamMutations';
import { getUsers } from '../../users/userQueries';
import { getRoles } from '../../roles/roleQueries';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { ROLE_QUERY_KEYS } from '../../roles/roleQueryKeys';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import { ROLES } from '../../../common/constants/roles';
import { User, Role } from '../../users/types/user';
import { RoleValue } from '../../../common/constants/roles';

interface AddMemberDialogProps {
  open: boolean;
  team: Team | null;
  onClose: () => void;
}

type AddMemberFormValues = {
  userId: string;
  role: RoleValue;
};

const addMemberSchema = Yup.object().shape({
  userId: Yup.string().required('User selection is required'),
  role: Yup.string().required('Role selection is required'),
});

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ open, team, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: open,
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: [ROLE_QUERY_KEYS.GET_ROLES],
    queryFn: getRoles,
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: open,
  });

  const { mutateAsync: addMemberMutate, isPending: isAdding } = useMutation({
    mutationFn: addTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      enqueueSnackbar('Member added successfully', { variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to add member', {
        variant: 'error',
      });
    },
  });

  const users: User[] = usersData?.data ?? [];
  const allRoles: Role[] = rolesData?.data ?? [];

  const availableUsers = useMemo(() => {
    if (!team || !team.teamMembers) return users;
    const existingMemberIds = team.teamMembers.map((member) => member.userId);
    return users.filter((user) => !existingMemberIds.includes(user.id));
  }, [users, team]);

  const availableRoles = useMemo(() => {
    return allRoles.filter((role) => role.name !== ROLES.SUPER_ADMIN);
  }, [allRoles]);

  const initialValues: AddMemberFormValues = {
    userId: '',
    role: ROLES.USER,
  };

  const handleSubmit = async (values: AddMemberFormValues): Promise<void> => {
    if (!team) return;

    const addMemberData: AddTeamMemberInput = {
      teamId: team.id,
      userId: values.userId,
      role: values.role,
    };

    await addMemberMutate(addMemberData);
  };

  const getUserDisplayName = (user: User): string => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName ? `${fullName} (${user.email})` : user.email;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        Add Team Member
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={addMemberSchema}
        onSubmit={handleSubmit}
        enableReinitialize>
        {({ errors, touched, values, setFieldValue, dirty }) => (
          <Form noValidate>
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl
                  fullWidth
                  required
                  error={touched.userId && !!errors.userId}
                  disabled={usersLoading || isAdding}>
                  <Autocomplete
                    options={availableUsers}
                    getOptionLabel={getUserDisplayName}
                    loading={usersLoading}
                    value={availableUsers.find((user) => user.id === values.userId) || null}
                    onChange={(_, newValue) => {
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
                          endAdornment: (
                            <>
                              {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    noOptionsText={
                      availableUsers.length === 0 && !usersLoading
                        ? 'All users are already team members'
                        : 'No users found'
                    }
                    disabled={usersLoading || isAdding}
                  />
                  {touched.userId && errors.userId && (
                    <FormHelperText error>{errors.userId}</FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  required
                  error={touched.role && !!errors.role}
                  disabled={rolesLoading || isAdding}>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Field
                    as={Select}
                    labelId="role-select-label"
                    name="role"
                    label="Role"
                    value={values.role}
                    onChange={(e: SelectChangeEvent<string>) => {
                      setFieldValue('role', e.target.value);
                    }}>
                    {rolesLoading ? (
                      <MenuItem value="" disabled>
                        <CircularProgress size={20} /> Loading roles...
                      </MenuItem>
                    ) : (
                      availableRoles.map((role) => (
                        <MenuItem key={role.id} value={role.name}>
                          {role.name}
                        </MenuItem>
                      ))
                    )}
                  </Field>
                  {touched.role && errors.role && <FormHelperText error>{errors.role}</FormHelperText>}
                </FormControl>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button onClick={onClose} disabled={isAdding}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isAdding || !dirty || availableUsers.length === 0}>
                {isAdding ? <CircularProgress size={24} /> : 'Add Member'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddMemberDialog;