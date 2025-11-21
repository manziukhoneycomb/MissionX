import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useCreateTeam, useUpdateTeam } from '../hooks/useTeams';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { CreateTeamInput, UpdateTeamInput } from '../types/team';

const teamValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name cannot exceed 100 characters')
    .required('Team name is required'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

interface TeamFormValues {
  name: string;
  description: string;
}

const TeamForm: React.FC = () => {
  const {
    isFormOpen,
    selectedTeam,
    closeForm,
  } = useTeamManagementStore();

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();

  const isEditing = !!selectedTeam;
  const isLoading = createTeamMutation.isPending || updateTeamMutation.isPending;

  const initialValues: TeamFormValues = {
    name: selectedTeam?.name || '',
    description: selectedTeam?.description || '',
  };

  const handleSubmit = async (values: TeamFormValues) => {
    try {
      if (isEditing && selectedTeam) {
        const updateData: UpdateTeamInput = {
          name: values.name,
          description: values.description || undefined,
        };
        await updateTeamMutation.mutateAsync({
          id: selectedTeam.id,
          data: updateData,
        });
      } else {
        const createData: CreateTeamInput = {
          name: values.name,
          description: values.description || undefined,
        };
        await createTeamMutation.mutateAsync(createData);
      }
      closeForm();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      closeForm();
    }
  };

  return (
    <Dialog
      open={isFormOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={teamValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, dirty, isValid }) => (
          <Form>
            <DialogTitle>
              {isEditing ? 'Edit Team' : 'Create New Team'}
            </DialogTitle>

            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <Field
                  as={TextField}
                  name="name"
                  label="Team Name"
                  fullWidth
                  required
                  disabled={isLoading}
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  autoFocus={!isEditing}
                />

                <Field
                  as={TextField}
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isLoading}
                  error={touched.description && !!errors.description}
                  helperText={
                    touched.description && errors.description
                      ? errors.description
                      : 'Optional description for the team'
                  }
                />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={handleClose}
                disabled={isLoading}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !dirty || !isValid}
                startIcon={isLoading ? <CircularProgress size={16} /> : null}
              >
                {isLoading
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update Team' : 'Create Team')
                }
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TeamForm;