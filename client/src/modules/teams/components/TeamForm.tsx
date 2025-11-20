import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  CircularProgress,
  Typography,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import { useCreateTeam, useUpdateTeam } from '../hooks/useTeams';
import { useTeamPermissions } from '../hooks/useTeams';
import { useTeamManagementStore } from '../stores/team-store';
import { CreateTeamInput, UpdateTeamInput } from '../types/team';

const teamSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters')
    .required('Team name is required'),
  description: Yup.string().max(500, 'Description must be less than 500 characters'),
  permissions: Yup.array().of(Yup.string()),
  isActive: Yup.boolean(),
});

type TeamFormValues = {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
};

const TeamForm: React.FC = () => {
  const { selectedTeam, closeForm } = useTeamManagementStore();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const { data: permissionsData, isLoading: permissionsLoading } = useTeamPermissions();

  const permissions = permissionsData?.data ?? [];
  const isEditing = !!selectedTeam;

  const initialValues: TeamFormValues = {
    name: selectedTeam?.name ?? '',
    description: selectedTeam?.description ?? '',
    permissions: selectedTeam?.permissions ?? [],
    isActive: selectedTeam?.isActive ?? true,
  };

  const handleSubmit = async (values: TeamFormValues) => {
    try {
      if (isEditing && selectedTeam) {
        const updateData: UpdateTeamInput = {
          name: values.name,
          description: values.description || undefined,
          permissions: values.permissions,
          isActive: values.isActive,
        };
        await updateTeamMutation.mutateAsync({ id: selectedTeam.id, data: updateData });
      } else {
        const createData: CreateTeamInput = {
          name: values.name,
          description: values.description || undefined,
          permissions: values.permissions,
        };
        await createTeamMutation.mutateAsync(createData);
      }
      closeForm();
    } catch (error) {
      // Error handling is done in the mutations
    }
  };

  const isSubmitting = createTeamMutation.isPending || updateTeamMutation.isPending;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Team' : 'Create New Team'}
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={teamSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue, dirty }) => (
          <Form noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <Field
                as={TextField}
                name="name"
                label="Team Name"
                fullWidth
                required
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                disabled={isSubmitting}
              />

              <Field
                as={TextField}
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                error={touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                disabled={isSubmitting}
              />

              <FormControl fullWidth error={touched.permissions && !!errors.permissions}>
                <InputLabel>Permissions</InputLabel>
                <Select<string[]>
                  multiple
                  value={values.permissions}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFieldValue('permissions', typeof value === 'string' ? value.split(',') : value);
                  }}
                  input={<OutlinedInput label="Permissions" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const permission = permissions.find(p => p.id === value);
                        return (
                          <Chip
                            key={value}
                            label={permission?.name || value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  disabled={isSubmitting || permissionsLoading}
                >
                  {permissionsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                      Loading permissions...
                    </MenuItem>
                  ) : (
                    permissions.map((permission) => (
                      <MenuItem key={permission.id} value={permission.id}>
                        <Box>
                          <Typography variant="body2">{permission.name}</Typography>
                          {permission.description && (
                            <Typography variant="caption" color="textSecondary">
                              {permission.description}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {touched.permissions && errors.permissions && (
                  <FormHelperText>{errors.permissions}</FormHelperText>
                )}
              </FormControl>

              {isEditing && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isActive}
                      onChange={(event) => setFieldValue('isActive', event.target.checked)}
                      disabled={isSubmitting}
                    />
                  }
                  label="Active"
                />
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  onClick={closeForm}
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
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditing ? 'Update Team' : 'Create Team'
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

export default TeamForm;